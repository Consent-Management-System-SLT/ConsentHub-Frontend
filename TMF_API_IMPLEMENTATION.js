// Missing TMF632 Privacy Consent API Implementation
// This should be added to comprehensive-backend.js

// TMF632 - Privacy Consent Management API
app.get('/api/tmf632/privacyConsent', async (req, res) => {
  try {
    const { partyId, status, purpose } = req.query;
    const query = {};
    
    if (partyId) query.partyId = partyId;
    if (status) query.status = status;
    if (purpose) query.purpose = purpose;
    
    const consents = await Consent.find(query);
    
    res.json({
      privacyConsent: consents.map(consent => ({
        id: consent.id,
        partyId: consent.partyId,
        purpose: consent.purpose,
        status: consent.status,
        channel: consent.channel,
        validFor: {
          startDateTime: consent.validFrom,
          endDateTime: consent.validTo
        },
        privacyNoticeId: consent.privacyNoticeId,
        versionAccepted: consent.versionAccepted,
        '@type': 'PrivacyConsent',
        '@schemaLocation': 'https://schemas.tmforum.org/TMF632/PrivacyConsent'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve privacy consents' });
  }
});

// TMF632 - Create Privacy Consent
app.post('/api/tmf632/privacyConsent', async (req, res) => {
  try {
    const consentData = req.body;
    const consent = new Consent({
      id: consentData.id || require('uuid').v4(),
      partyId: consentData.partyId,
      purpose: consentData.purpose,
      status: consentData.status || 'granted',
      channel: consentData.channel,
      validFrom: consentData.validFor?.startDateTime,
      validTo: consentData.validFor?.endDateTime,
      privacyNoticeId: consentData.privacyNoticeId,
      versionAccepted: consentData.versionAccepted,
      grantedAt: new Date(),
      source: 'tmf632-api'
    });
    
    await consent.save();
    
    // Emit TMF669 Event
    await publishEvent({
      eventType: 'PrivacyConsentCreatedEvent',
      resource: consent,
      eventTime: new Date().toISOString()
    });
    
    res.status(201).json({
      id: consent.id,
      '@type': 'PrivacyConsent'
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create privacy consent' });
  }
});

// TMF669 - Event Management Hub Registration
app.post('/api/tmf669/hub', async (req, res) => {
  try {
    const { callback, query } = req.body;
    
    // Store webhook registration
    const webhook = new Webhook({
      id: require('uuid').v4(),
      url: callback,
      events: query.split(','),
      status: 'active',
      createdAt: new Date()
    });
    
    await webhook.save();
    
    res.status(201).json({
      id: webhook.id,
      callback: webhook.url,
      query: webhook.events.join(',')
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to register webhook' });
  }
});

// TMF641 - Party Management API
app.get('/api/tmf641/party/:id', async (req, res) => {
  try {
    const party = await User.findById(req.params.id);
    
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }
    
    res.json({
      id: party.id,
      name: party.name,
      '@type': 'Individual',
      characteristic: [
        { name: 'email', value: party.email },
        { name: 'mobile', value: party.phone }
      ],
      contactMedium: [
        {
          mediumType: 'email',
          preferred: true,
          characteristic: {
            emailAddress: party.email
          }
        }
      ],
      '@schemaLocation': 'https://schemas.tmforum.org/TMF641/Party'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve party' });
  }
});

async function publishEvent(eventData) {
  // Publish to registered webhooks
  const webhooks = await Webhook.find({ status: 'active' });
  
  const eventPayload = {
    eventId: require('uuid').v4(),
    eventTime: eventData.eventTime,
    eventType: eventData.eventType,
    event: {
      resource: eventData.resource
    },
    domain: 'ConsentHub',
    source: 'consent-service'
  };
  
  // Send to all registered webhooks
  for (const webhook of webhooks) {
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload)
      });
    } catch (error) {
      console.error(`Failed to notify webhook ${webhook.url}:`, error);
    }
  }
}

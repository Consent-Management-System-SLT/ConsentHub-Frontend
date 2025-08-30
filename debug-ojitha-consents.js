const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://ojitharaj:Ojitha%40123@cluster0.hb7nx.mongodb.net/consentManagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas
const partySchema = new mongoose.Schema({}, { collection: 'parties', strict: false });
const consentSchema = new mongoose.Schema({}, { collection: 'consents', strict: false });
const auditLogSchema = new mongoose.Schema({}, { collection: 'auditLogs', strict: false });

const Party = mongoose.model('Party', partySchema);
const Consent = mongoose.model('Consent', consentSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

async function debugOjithaData() {
  try {
    console.log('🔍 Debugging Ojitha consent data...\n');

    // 1. Find Ojitha's party record
    console.log('=== 1. SEARCHING FOR OJITHA PARTY ===');
    const ojithaParties = await Party.find({
      $or: [
        { email: { $regex: /ojitharajapaksha/i } },
        { name: { $regex: /ojitha/i } },
        { _id: new mongoose.Types.ObjectId('68ae007022c61b8784d852ea') }
      ]
    }).lean();
    
    console.log(`Found ${ojithaParties.length} matching parties:`);
    ojithaParties.forEach((party, i) => {
      console.log(`Party ${i + 1}:`, {
        id: party._id.toString(),
        name: party.name,
        email: party.email,
        type: party.type,
        status: party.status
      });
    });

    if (ojithaParties.length === 0) {
      console.log('❌ No party found for Ojitha! This might be the issue.');
      
      // Show all parties to help identify
      const allParties = await Party.find({}).limit(10).lean();
      console.log('\nAll parties (first 10):');
      allParties.forEach((party, i) => {
        console.log(`${i + 1}. ID: ${party._id}, Email: ${party.email}, Name: ${party.name}`);
      });
      return;
    }

    const ojithaParty = ojithaParties[0];
    console.log(`\n✅ Using Ojitha party: ${ojithaParty._id} (${ojithaParty.email})`);

    // 2. Find consents for Ojitha
    console.log('\n=== 2. SEARCHING FOR OJITHA CONSENTS ===');
    const ojithaConsents = await Consent.find({
      $or: [
        { partyId: ojithaParty._id.toString() },
        { customerId: ojithaParty._id.toString() },
        { userId: ojithaParty._id.toString() },
        { partyId: new mongoose.Types.ObjectId(ojithaParty._id) },
        { customerId: new mongoose.Types.ObjectId(ojithaParty._id) }
      ]
    }).sort({ updatedAt: -1, createdAt: -1 }).lean();

    console.log(`Found ${ojithaConsents.length} consents for Ojitha:`);
    ojithaConsents.forEach((consent, i) => {
      console.log(`Consent ${i + 1}:`, {
        id: consent._id?.toString(),
        purpose: consent.purpose,
        status: consent.status,
        partyId: consent.partyId,
        customerId: consent.customerId,
        createdAt: consent.createdAt,
        updatedAt: consent.updatedAt,
        revokedAt: consent.revokedAt,
        timestampRevoked: consent.timestampRevoked
      });
    });

    // 3. Look for recent "research" consent specifically
    console.log('\n=== 3. SEARCHING FOR RESEARCH CONSENT ===');
    const researchConsents = await Consent.find({
      $and: [
        {
          $or: [
            { partyId: ojithaParty._id.toString() },
            { customerId: ojithaParty._id.toString() },
            { partyId: new mongoose.Types.ObjectId(ojithaParty._id) },
            { customerId: new mongoose.Types.ObjectId(ojithaParty._id) }
          ]
        },
        { purpose: { $regex: /research/i } }
      ]
    }).sort({ updatedAt: -1, createdAt: -1 }).lean();

    console.log(`Found ${researchConsents.length} research consents:`);
    researchConsents.forEach((consent, i) => {
      console.log(`Research consent ${i + 1}:`, {
        id: consent._id?.toString(),
        purpose: consent.purpose,
        status: consent.status,
        validFrom: consent.validFrom,
        validTo: consent.validTo,
        createdAt: consent.createdAt,
        updatedAt: consent.updatedAt,
        revokedAt: consent.revokedAt,
        timestampRevoked: consent.timestampRevoked,
        geoLocation: consent.geoLocation
      });
    });

    // 4. Check recent audit logs for Ojitha
    console.log('\n=== 4. CHECKING RECENT AUDIT LOGS ===');
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentAuditLogs = await AuditLog.find({
      $and: [
        {
          $or: [
            { userId: ojithaParty._id.toString() },
            { actorId: ojithaParty._id.toString() },
            { 'details.customerId': ojithaParty._id.toString() }
          ]
        },
        { timestamp: { $gte: fiveMinutesAgo } }
      ]
    }).sort({ timestamp: -1 }).lean();

    console.log(`Found ${recentAuditLogs.length} recent audit logs for Ojitha:`);
    recentAuditLogs.forEach((log, i) => {
      console.log(`Audit log ${i + 1}:`, {
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        userId: log.userId,
        timestamp: log.timestamp,
        details: log.details
      });
    });

    // 5. Check all consents updated in the last hour
    console.log('\n=== 5. ALL RECENT CONSENT UPDATES ===');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentConsents = await Consent.find({
      updatedAt: { $gte: oneHourAgo }
    }).sort({ updatedAt: -1 }).lean();

    console.log(`Found ${recentConsents.length} consents updated in the last hour:`);
    recentConsents.forEach((consent, i) => {
      console.log(`Recent consent ${i + 1}:`, {
        id: consent._id?.toString(),
        purpose: consent.purpose,
        status: consent.status,
        partyId: consent.partyId,
        customerId: consent.customerId,
        updatedAt: consent.updatedAt
      });
    });

    console.log('\n🔍 Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugOjithaData();

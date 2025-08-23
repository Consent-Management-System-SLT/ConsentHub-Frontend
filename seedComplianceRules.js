const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/database');
const ComplianceRule = require('./models/ComplianceRule');
const User = require('./models/User');

// Connect to MongoDB
connectDB();

async function seedComplianceRules() {
    try {
        console.log('🌱 Starting compliance rules seeding...');
        
        // Clear existing rules
        await ComplianceRule.deleteMany({});
        console.log('🗑️ Cleared existing compliance rules');
        
        // Get admin user for created_by field
        let adminUser = await User.findOne({ email: 'admin@sltmobitel.lk' });
        if (!adminUser) {
            console.log('👤 Creating admin user for compliance rules...');
            adminUser = await User.create({
                email: 'admin@sltmobitel.lk',
                password: 'admin123',
                name: 'System Administrator',
                role: 'admin',
                phone: '+94711234567'
            });
        }

        const complianceRules = [
            {
                name: 'GDPR Consent Expiration Management',
                description: 'Automatically expire and notify users about consent renewals according to GDPR Article 7 requirements. Ensures consent remains freely given, specific, informed and unambiguous.',
                ruleType: 'GDPR',
                category: 'consent',
                status: 'active',
                priority: 'critical',
                conditions: [
                    {
                        field: 'consent_date',
                        operator: 'less_than',
                        value: '12 months ago'
                    },
                    {
                        field: 'data_subject_region',
                        operator: 'in',
                        value: ['EU', 'UK']
                    }
                ],
                actions: [
                    {
                        type: 'send_email',
                        parameters: {
                            template: 'consent_renewal_notice',
                            subject: 'Consent Renewal Required - SLT Mobitel Privacy Notice'
                        },
                        delay: 0
                    },
                    {
                        type: 'expire_consent',
                        parameters: {
                            grace_period: 30
                        },
                        delay: 2880 // 48 hours
                    }
                ],
                triggers: [
                    {
                        event: 'scheduled',
                        schedule: '0 2 * * *' // Daily at 2 AM
                    }
                ],
                applicableRegions: ['EU', 'UK', 'GLOBAL'],
                dataTypes: ['personal_data', 'marketing_data', 'behavioral_data'],
                retentionPeriod: {
                    value: 12,
                    unit: 'months'
                },
                compliance_requirements: {
                    legal_basis: 'consent',
                    data_subject_rights: ['access', 'rectification', 'erasure', 'portability', 'objection'],
                    breach_notification_required: false,
                    dpo_notification_required: true
                },
                implementation: {
                    auto_enforcement: true,
                    manual_review_required: false,
                    escalation_threshold: 100
                },
                metrics: {
                    enforcement_count: 156,
                    success_rate: 94.2,
                    last_executed: new Date('2025-01-20T02:00:00Z'),
                    avg_execution_time: 2340
                },
                tags: ['gdpr', 'consent', 'automation', 'critical'],
                created_by: adminUser._id,
                approved_by: adminUser._id,
                approval_date: new Date('2024-12-01'),
                next_review_date: new Date('2025-03-01')
            },
            {
                name: 'CCPA Personal Information Sale Opt-Out',
                description: 'Implement "Do Not Sell My Personal Information" rights under CCPA Section 1798.120. Automatically process opt-out requests and update data processing flags.',
                ruleType: 'CCPA',
                category: 'privacy_rights',
                status: 'active',
                priority: 'critical',
                conditions: [
                    {
                        field: 'data_subject_region',
                        operator: 'equals',
                        value: 'US'
                    },
                    {
                        field: 'state',
                        operator: 'equals',
                        value: 'CA'
                    }
                ],
                actions: [
                    {
                        type: 'block_processing',
                        parameters: {
                            processing_types: ['marketing', 'analytics', 'third_party_sharing'],
                            effective_immediately: true
                        },
                        delay: 0
                    },
                    {
                        type: 'send_email',
                        parameters: {
                            template: 'ccpa_opt_out_confirmation',
                            subject: 'Your CCPA Opt-Out Request Confirmed - SLT Mobitel'
                        },
                        delay: 5
                    }
                ],
                triggers: [
                    {
                        event: 'consent_withdrawn'
                    },
                    {
                        event: 'manual'
                    }
                ],
                applicableRegions: ['US'],
                dataTypes: ['personal_data', 'marketing_data', 'behavioral_data', 'analytics_data'],
                retentionPeriod: {
                    value: 24,
                    unit: 'months'
                },
                compliance_requirements: {
                    legal_basis: 'consent',
                    data_subject_rights: ['access', 'erasure', 'objection'],
                    breach_notification_required: false,
                    dpo_notification_required: false
                },
                implementation: {
                    auto_enforcement: true,
                    manual_review_required: false,
                    escalation_threshold: 50
                },
                metrics: {
                    enforcement_count: 43,
                    success_rate: 100,
                    last_executed: new Date('2025-01-18T14:22:00Z'),
                    avg_execution_time: 890
                },
                tags: ['ccpa', 'opt-out', 'privacy-rights', 'california'],
                created_by: adminUser._id,
                approved_by: adminUser._id,
                approval_date: new Date('2024-11-15'),
                next_review_date: new Date('2025-05-15')
            },
            {
                name: 'Automated Data Retention - Inactive Users',
                description: 'Delete personal data for users inactive for 36 months in compliance with data minimization principles. Applies GDPR Article 5(1)(e) and organizational data retention policies.',
                ruleType: 'Data_Retention',
                category: 'data_retention',
                status: 'active',
                priority: 'high',
                conditions: [
                    {
                        field: 'last_activity_date',
                        operator: 'less_than',
                        value: '36 months ago'
                    },
                    {
                        field: 'account_status',
                        operator: 'not_equals',
                        value: 'suspended'
                    }
                ],
                actions: [
                    {
                        type: 'send_email',
                        parameters: {
                            template: 'data_deletion_notice',
                            subject: 'Account Inactivity - Data Deletion Notice'
                        },
                        delay: 0
                    },
                    {
                        type: 'anonymize',
                        parameters: {
                            fields: ['name', 'email', 'phone', 'address'],
                            preserve_analytics: true
                        },
                        delay: 10080 // 7 days
                    },
                    {
                        type: 'delete_data',
                        parameters: {
                            complete_deletion: true,
                            backup_retention: 90
                        },
                        delay: 11520 // 8 days total
                    }
                ],
                triggers: [
                    {
                        event: 'scheduled',
                        schedule: '0 1 1 * *' // Monthly on 1st at 1 AM
                    }
                ],
                applicableRegions: ['EU', 'UK', 'US', 'CA', 'GLOBAL'],
                dataTypes: ['personal_data', 'marketing_data', 'behavioral_data'],
                retentionPeriod: {
                    value: 36,
                    unit: 'months'
                },
                compliance_requirements: {
                    legal_basis: 'legitimate_interests',
                    data_subject_rights: ['access', 'rectification', 'erasure'],
                    breach_notification_required: false,
                    dpo_notification_required: true
                },
                implementation: {
                    auto_enforcement: false,
                    manual_review_required: true,
                    escalation_threshold: 25
                },
                metrics: {
                    enforcement_count: 8,
                    success_rate: 87.5,
                    last_executed: new Date('2025-01-01T01:00:00Z'),
                    avg_execution_time: 45600
                },
                tags: ['data-retention', 'deletion', 'inactive-users', 'gdpr'],
                created_by: adminUser._id,
                approved_by: adminUser._id,
                approval_date: new Date('2024-10-01'),
                next_review_date: new Date('2025-04-01')
            },
            {
                name: 'Marketing Communications Consent Validation',
                description: 'Ensure all marketing communications have valid, current consent. Block communications to users without proper consent and maintain audit trail for compliance reporting.',
                ruleType: 'Marketing',
                category: 'marketing',
                status: 'active',
                priority: 'high',
                conditions: [
                    {
                        field: 'marketing_consent_status',
                        operator: 'not_equals',
                        value: 'granted'
                    },
                    {
                        field: 'communication_type',
                        operator: 'in',
                        value: ['email_marketing', 'sms_marketing', 'push_notifications']
                    }
                ],
                actions: [
                    {
                        type: 'block_processing',
                        parameters: {
                            processing_types: ['email_marketing', 'sms_marketing'],
                            create_suppression_list: true
                        },
                        delay: 0
                    },
                    {
                        type: 'create_task',
                        parameters: {
                            assignee: 'marketing_team',
                            task: 'Review blocked communication attempt',
                            priority: 'medium'
                        },
                        delay: 60
                    }
                ],
                triggers: [
                    {
                        event: 'data_created'
                    }
                ],
                applicableRegions: ['EU', 'UK', 'US', 'CA', 'AU', 'GLOBAL'],
                dataTypes: ['marketing_data', 'personal_data'],
                compliance_requirements: {
                    legal_basis: 'consent',
                    data_subject_rights: ['access', 'rectification', 'objection'],
                    breach_notification_required: false,
                    dpo_notification_required: false
                },
                implementation: {
                    auto_enforcement: true,
                    manual_review_required: false,
                    escalation_threshold: 200
                },
                metrics: {
                    enforcement_count: 1247,
                    success_rate: 99.1,
                    last_executed: new Date('2025-01-19T16:45:00Z'),
                    avg_execution_time: 156
                },
                tags: ['marketing', 'consent-validation', 'communications', 'automation'],
                created_by: adminUser._id,
                approved_by: adminUser._id,
                approval_date: new Date('2024-09-15'),
                next_review_date: new Date('2025-03-15')
            },
            {
                name: 'Data Breach Notification Protocol',
                description: 'Automate data breach response according to GDPR Article 33 and 34. Notify supervisory authorities within 72 hours and data subjects when high risk is identified.',
                ruleType: 'GDPR',
                category: 'breach_notification',
                status: 'active',
                priority: 'critical',
                conditions: [
                    {
                        field: 'incident_severity',
                        operator: 'in',
                        value: ['high', 'critical']
                    },
                    {
                        field: 'data_types_affected',
                        operator: 'contains',
                        value: 'personal_data'
                    }
                ],
                actions: [
                    {
                        type: 'notify',
                        parameters: {
                            recipients: ['dpo@sltmobitel.lk', 'security@sltmobitel.lk'],
                            urgency: 'immediate',
                            template: 'breach_notification_internal'
                        },
                        delay: 0
                    },
                    {
                        type: 'create_task',
                        parameters: {
                            assignee: 'dpo',
                            task: 'Assess breach risk and notify supervisory authority',
                            due_date: '72 hours',
                            priority: 'critical'
                        },
                        delay: 5
                    },
                    {
                        type: 'send_email',
                        parameters: {
                            recipients: 'affected_data_subjects',
                            template: 'breach_notification_data_subjects',
                            condition: 'high_risk_to_individuals'
                        },
                        delay: 4320 // 72 hours maximum
                    }
                ],
                triggers: [
                    {
                        event: 'data_created'
                    },
                    {
                        event: 'manual'
                    }
                ],
                applicableRegions: ['EU', 'UK'],
                dataTypes: ['personal_data', 'sensitive_data', 'financial_data'],
                compliance_requirements: {
                    legal_basis: 'legal_obligation',
                    data_subject_rights: ['access', 'rectification'],
                    breach_notification_required: true,
                    dpo_notification_required: true
                },
                implementation: {
                    auto_enforcement: true,
                    manual_review_required: true,
                    escalation_threshold: 1
                },
                metrics: {
                    enforcement_count: 0,
                    success_rate: 0,
                    last_executed: null,
                    avg_execution_time: null
                },
                tags: ['gdpr', 'breach-notification', 'security', 'critical'],
                created_by: adminUser._id,
                approved_by: adminUser._id,
                approval_date: new Date('2024-08-01'),
                next_review_date: new Date('2025-02-01')
            },
            {
                name: 'Cookie Consent Management - EU Visitors',
                description: 'Manage cookie consent for EU visitors according to ePrivacy Directive and GDPR. Block non-essential cookies until explicit consent is obtained.',
                ruleType: 'Cookie_Policy',
                category: 'cookies',
                status: 'active',
                priority: 'medium',
                conditions: [
                    {
                        field: 'user_region',
                        operator: 'in',
                        value: ['EU', 'UK']
                    },
                    {
                        field: 'cookie_consent_status',
                        operator: 'not_equals',
                        value: 'granted'
                    }
                ],
                actions: [
                    {
                        type: 'block_processing',
                        parameters: {
                            processing_types: ['analytics_cookies', 'marketing_cookies', 'personalization_cookies'],
                            allow_essential: true
                        },
                        delay: 0
                    },
                    {
                        type: 'notify',
                        parameters: {
                            display_consent_banner: true,
                            granular_choices: true
                        },
                        delay: 0
                    }
                ],
                triggers: [
                    {
                        event: 'user_inactive'
                    }
                ],
                applicableRegions: ['EU', 'UK'],
                dataTypes: ['behavioral_data', 'analytics_data'],
                retentionPeriod: {
                    value: 12,
                    unit: 'months'
                },
                compliance_requirements: {
                    legal_basis: 'consent',
                    data_subject_rights: ['access', 'objection'],
                    breach_notification_required: false,
                    dpo_notification_required: false
                },
                implementation: {
                    auto_enforcement: true,
                    manual_review_required: false,
                    escalation_threshold: 1000
                },
                metrics: {
                    enforcement_count: 3456,
                    success_rate: 96.8,
                    last_executed: new Date('2025-01-20T10:30:00Z'),
                    avg_execution_time: 45
                },
                tags: ['cookies', 'eprivacy', 'gdpr', 'eu-visitors'],
                created_by: adminUser._id,
                approved_by: adminUser._id,
                approval_date: new Date('2024-07-15'),
                next_review_date: new Date('2025-07-15')
            },
            {
                name: 'Minor Data Protection - Parental Consent',
                description: 'Ensure parental consent for processing personal data of children under 16 (EU) or 13 (US) in accordance with GDPR Article 8 and COPPA requirements.',
                ruleType: 'GDPR',
                category: 'consent',
                status: 'pending_review',
                priority: 'critical',
                conditions: [
                    {
                        field: 'age',
                        operator: 'less_than',
                        value: 16
                    },
                    {
                        field: 'region',
                        operator: 'in',
                        value: ['EU', 'UK']
                    }
                ],
                actions: [
                    {
                        type: 'block_processing',
                        parameters: {
                            processing_types: ['all'],
                            require_parental_consent: true
                        },
                        delay: 0
                    },
                    {
                        type: 'create_task',
                        parameters: {
                            assignee: 'legal_team',
                            task: 'Verify parental consent documentation',
                            priority: 'high'
                        },
                        delay: 30
                    }
                ],
                triggers: [
                    {
                        event: 'data_created'
                    }
                ],
                applicableRegions: ['EU', 'UK', 'US'],
                dataTypes: ['personal_data', 'sensitive_data'],
                compliance_requirements: {
                    legal_basis: 'consent',
                    data_subject_rights: ['access', 'rectification', 'erasure'],
                    breach_notification_required: true,
                    dpo_notification_required: true
                },
                implementation: {
                    auto_enforcement: false,
                    manual_review_required: true,
                    escalation_threshold: 1
                },
                metrics: {
                    enforcement_count: 2,
                    success_rate: 100,
                    last_executed: new Date('2024-12-15T09:15:00Z'),
                    avg_execution_time: 1200
                },
                tags: ['minors', 'parental-consent', 'gdpr', 'coppa'],
                created_by: adminUser._id,
                next_review_date: new Date('2025-02-28')
            },
            {
                name: 'Right to be Forgotten - Automated Processing',
                description: 'Process right to erasure requests automatically when legally compliant. Verify request legitimacy and execute deletion across all systems within 30 days.',
                ruleType: 'GDPR',
                category: 'privacy_rights',
                status: 'draft',
                priority: 'high',
                conditions: [
                    {
                        field: 'request_type',
                        operator: 'equals',
                        value: 'right_to_erasure'
                    },
                    {
                        field: 'legal_obligations_check',
                        operator: 'equals',
                        value: 'no_restrictions'
                    }
                ],
                actions: [
                    {
                        type: 'anonymize',
                        parameters: {
                            full_anonymization: true,
                            preserve_analytics: false
                        },
                        delay: 4320 // 72 hours for review
                    },
                    {
                        type: 'send_email',
                        parameters: {
                            template: 'erasure_confirmation',
                            subject: 'Your Data Erasure Request Completed'
                        },
                        delay: 4380
                    }
                ],
                triggers: [
                    {
                        event: 'manual'
                    }
                ],
                applicableRegions: ['EU', 'UK'],
                dataTypes: ['personal_data', 'marketing_data', 'behavioral_data'],
                compliance_requirements: {
                    legal_basis: 'consent',
                    data_subject_rights: ['erasure'],
                    breach_notification_required: false,
                    dpo_notification_required: true
                },
                implementation: {
                    auto_enforcement: false,
                    manual_review_required: true,
                    escalation_threshold: 5
                },
                metrics: {
                    enforcement_count: 0,
                    success_rate: 0,
                    last_executed: null,
                    avg_execution_time: null
                },
                tags: ['right-to-be-forgotten', 'erasure', 'gdpr', 'data-subject-rights'],
                created_by: adminUser._id,
                next_review_date: new Date('2025-03-31')
            }
        ];

        // Insert compliance rules
        const insertedRules = await ComplianceRule.insertMany(complianceRules);
        console.log(`✅ Successfully seeded ${insertedRules.length} compliance rules:`);
        
        insertedRules.forEach(rule => {
            console.log(`   📋 ${rule.name} (${rule.ruleType}/${rule.category}) - ${rule.status}`);
        });

        // Display summary
        const stats = {
            total: insertedRules.length,
            active: insertedRules.filter(r => r.status === 'active').length,
            pending: insertedRules.filter(r => r.status === 'pending_review').length,
            draft: insertedRules.filter(r => r.status === 'draft').length,
            critical: insertedRules.filter(r => r.priority === 'critical').length,
            high: insertedRules.filter(r => r.priority === 'high').length,
            gdpr: insertedRules.filter(r => r.ruleType === 'GDPR').length,
            ccpa: insertedRules.filter(r => r.ruleType === 'CCPA').length
        };

        console.log('\n📊 Compliance Rules Summary:');
        console.log(`   Total Rules: ${stats.total}`);
        console.log(`   Active: ${stats.active} | Pending Review: ${stats.pending} | Draft: ${stats.draft}`);
        console.log(`   Critical Priority: ${stats.critical} | High Priority: ${stats.high}`);
        console.log(`   GDPR Rules: ${stats.gdpr} | CCPA Rules: ${stats.ccpa}`);
        console.log('\n🎯 Compliance rules seeded successfully!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding compliance rules:', error);
        process.exit(1);
    }
}

// Only run if called directly
if (require.main === module) {
    seedComplianceRules();
}

module.exports = seedComplianceRules;

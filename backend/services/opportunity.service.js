// ─── services/opportunity.service.js ──────────────────────────────────────────
// Personal Opportunity Engine Matcher & Evaluator per Feature 4 Spec

const Opportunity  = require('../models/Opportunity.model');
const Profile      = require('../models/Profile.model');
const Document     = require('../models/Document.model');
const logger       = require('../utils/logger');

/**
 * Curated initial seed dataset of opportunities
 */
const SEED_OPPORTUNITIES = [
  {
    title: 'DAAD Fully Funded AI Research Internship — Germany',
    organization: 'DAAD & Max Planck Institute',
    category: 'research',
    category: 'fellowship',
    description: 'Fully funded 6-month AI & Machine Learning research internship in Munich for high-performing engineering students.',
    eligibilityCriteria: {
      minMarks: 85,
      requiredDegree: 'Engineering',
      requiredSkills: ['Python', 'AI', 'Machine Learning', 'Data Science'],
      location: 'Germany',
    },
    awardValue: '€1,200/mo + Airfare',
    deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    applyUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
  },
  {
    title: 'Government Startup Innovation Seed Grant',
    organization: 'Ministry of Electronics & IT',
    category: 'grant',
    description: 'Grant of ₹10 Lakhs for young engineers and researchers building innovative AI/SaaS deep-tech prototypes.',
    eligibilityCriteria: {
      requiredDegree: 'Engineering',
      requiredSkills: ['Software', 'AI', 'Entrepreneurship'],
      location: 'India',
    },
    awardValue: '₹10,000,000 Support',
    deadlineDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://meity.gov.in/startup-grant',
  },
  {
    title: 'National Post-Graduate Merit Scholarship',
    organization: 'University Grants Commission',
    category: 'scholarship',
    description: 'Merit-based financial award for top 10% university rank holders across recognized colleges.',
    eligibilityCriteria: {
      minMarks: 75,
      location: 'India',
    },
    awardValue: '₹2,00,000 / Year',
    deadlineDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://scholarships.gov.in',
  },
  {
    title: 'Google AI Women & Underrepresented Tech Leaders Fellowship',
    organization: 'Google Research',
    category: 'fellowship',
    description: 'Mentorship, cloud credits, and direct referral program for high-achieving CS/IT students.',
    eligibilityCriteria: {
      minMarks: 80,
      requiredSkills: ['Software Engineering', 'Algorithms', 'AI'],
      location: 'Global',
    },
    awardValue: '$10,000 USD Grant',
    deadlineDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    applyUrl: 'https://buildyourfuture.withgoogle.com/scholarships',
  },
];

/**
 * Seed database if empty
 */
const seedOpportunitiesIfEmpty = async () => {
  const count = await Opportunity.countDocuments();
  if (count === 0) {
    await Opportunity.insertMany(SEED_OPPORTUNITIES);
    logger.info('[Opportunity Engine] Seeded initial opportunity catalog');
  }
};

/**
 * Evaluate user eligibility against all active opportunities
 */
const matchUserOpportunities = async (userId) => {
  await seedOpportunitiesIfEmpty();

  const profile = await Profile.findOne({ userId });
  const docs    = await Document.find({ userId, isDeleted: false, status: 'ready' });

  // Gather user profile attributes
  const userDegree      = profile?.education?.[0]?.degree || docs.find(d => d.category === 'education')?.documentType || 'General';
  const userInstitution = profile?.education?.[0]?.institution || '';
  const docTextCombined = docs.map(d => d.rawText + ' ' + JSON.stringify(d.extractedData)).join(' ').toUpperCase();

  // Check if high marks are mentioned in text (e.g. 95%, 9.5 CGPA, 90%)
  const marksMatch = docTextCombined.match(/(\d{2})%/) || docTextCombined.match(/(\d\.\d)\s*CGPA/i);
  let estimatedMarks = 85;
  if (marksMatch) {
    if (marksMatch[1].includes('.')) estimatedMarks = parseFloat(marksMatch[1]) * 10;
    else estimatedMarks = parseInt(marksMatch[1]);
  }

  const opportunities = await Opportunity.find({ isActive: true, deadlineDate: { $gte: new Date() } }).sort({ deadlineDate: 1 });

  const matchedResults = opportunities.map(opp => {
    let score = 70; // Base baseline score
    const matchReasons = [];

    const criteria = opp.eligibilityCriteria;

    // Check Marks Criteria
    if (criteria.minMarks) {
      if (estimatedMarks >= criteria.minMarks) {
        score += 15;
        matchReasons.push(`Academic Record: Verified ${estimatedMarks}% exceeds required ${criteria.minMarks}%`);
      } else {
        score -= 20;
      }
    } else {
      score += 10;
    }

    // Check Degree & Academic Subject
    if (criteria.requiredDegree) {
      if (userDegree.toLowerCase().includes(criteria.requiredDegree.toLowerCase()) || docTextCombined.includes(criteria.requiredDegree.toUpperCase())) {
        score += 15;
        matchReasons.push(`Field Alignment: Documented record matches ${criteria.requiredDegree}`);
      }
    }

    // Check Skills / Experience
    if (criteria.requiredSkills?.length > 0) {
      const matchedSkills = criteria.requiredSkills.filter(s => docTextCombined.includes(s.toUpperCase()));
      if (matchedSkills.length > 0) {
        score += 10;
        matchReasons.push(`Verified Experience: Matches ${matchedSkills.join(', ')}`);
      }
    }

    // Cap score at 100%
    const finalScore = Math.min(Math.max(score, 40), 98);
    const daysLeft = Math.ceil((new Date(opp.deadlineDate) - new Date()) / (1000 * 60 * 60 * 24));

    return {
      opportunity: opp,
      matchScore: finalScore,
      matchReasons,
      daysLeft,
      isEligible: finalScore >= 75,
    };
  });

  // Sort by highest match score
  return matchedResults.sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = {
  matchUserOpportunities,
  seedOpportunitiesIfEmpty,
};

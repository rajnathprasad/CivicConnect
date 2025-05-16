const Scheme = require('../models/Scheme');

// Flexible eligibility logic with detailed mismatch logging
function isEligibleForScheme(user, scheme) {
  const checks = [
    {
      field: 'gender',
      match: !scheme.gender || scheme.gender === 'All' || !user.gender || scheme.gender === user.gender,
    },
    {
      field: 'maritalStatus',
      match: !scheme.maritalStatus || scheme.maritalStatus === 'All' || !user.maritalStatus || scheme.maritalStatus === user.maritalStatus,
    },
    {
      field: 'state',
      match: !scheme.state || scheme.state === 'All' || !user.state || scheme.state === user.state,
    },
    {
      field: 'occupation',
      match: !scheme.occupation || scheme.occupation === 'All' || !user.occupation || scheme.occupation === user.occupation,
    },
    {
      field: 'educationLevel',
      match: !scheme.educationLevel || scheme.educationLevel === 'All' || !user.educationLevel || scheme.educationLevel === user.educationLevel,
    },
    {
      field: 'ruralOrUrban',
      match: !scheme.ruralOrUrban || scheme.ruralOrUrban === 'All' || !user.ruralOrUrban || scheme.ruralOrUrban === user.ruralOrUrban,
    },
    {
      field: 'hasGirlChild',
      match: scheme.hasGirlChild !== true || user.hasGirlChild === true,
    },
    {
      field: 'isFarmer',
      match: scheme.isFarmer !== true || user.isFarmer === true,
    },
    {
      field: 'isPregnantOrMother',
      match: scheme.isPregnantOrMother !== true || user.isPregnantOrMother === true,
    },
    {
      field: 'isDisabled',
      match: scheme.isDisabled !== true || user.isDisabled === true,
    },
  ];

  const failedChecks = checks.filter(c => !c.match).map(c => c.field);

  if (failedChecks.length > 0) {
    console.log(`❌ Scheme "${scheme.schemeName}" not eligible for user "${user.name}" due to:`, failedChecks);
    return false;
  }

  return true;
}

exports.renderUserDashboard = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const user = req.session.user;
    const query = req.query.q || '';
    const view = req.query.view || 'for-you';
    const allSchemes = await Scheme.find();

    let filteredSchemes = allSchemes;

    if (query) {
      const regex = new RegExp(query, 'i');
      filteredSchemes = filteredSchemes.filter(
        (s) =>
          regex.test(s.schemeName || '') ||
          regex.test(s.schemeDescription || '')
      );
    }

    if (view === 'for-you') {
      filteredSchemes = filteredSchemes.filter((scheme) =>
        isEligibleForScheme(user, scheme)
      );
    }

    res.render('dashboard', {
      user,
      schemes: filteredSchemes,
      query,
      currentView: view,
    });
  } catch (error) {
    console.error('Error loading user dashboard:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.renderDashboard = async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.render('dashboard', {
      user: req.session.user || null,
      schemes,
      query: '',
      currentView: 'all',
    });
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    res.status(500).send('Something went wrong');
  }
};

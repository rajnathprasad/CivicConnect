const Scheme = require('../models/Scheme');
const Comment = require('../models/Comment');

// View Scheme + Comments
exports.viewScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id).populate('comments');
    const user = req.session.user; // Get user from session

    if (!scheme) return res.status(404).send('Scheme not found');

    res.render('scheme', {
      scheme,
      user // 👈 THIS LINE FIXES IT
    });
  } catch (err) {
    console.error('Error loading scheme:', err);
    res.status(500).send('Something went wrong');
  }
};


// Post Comment
exports.postComment = async (req, res) => {
  const { content } = req.body;
  const user = req.session.user?.name || 'Anonymous';

  try {
    const newComment = new Comment({
      scheme: req.params.id,
      user,
      content
    });
    console.log('Incoming comment:', content, 'by', user);

    const savedComment = await newComment.save();

    await Scheme.findByIdAndUpdate(req.params.id, {
      $push: { comments: savedComment._id }
    });

    res.redirect(`/scheme/${req.params.id}`);
  } catch (err) {
    console.error('Error posting comment:', err);  // Show exact error
    res.status(500).send('Error posting comment');
  }
};


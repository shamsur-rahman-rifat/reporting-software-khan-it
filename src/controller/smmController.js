import smmModel from '../model/SMMLink.js';

// ✅ Add single or multiple Social Media links
export const addSmmLinks = async (req, res) => {
  try {
    let reqBody = req.body;
    const now = new Date();
    const publishDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })


    // Normalize input to always be an array
    if (!Array.isArray(reqBody)) {
      reqBody = [reqBody];
    }

    // Attach createdBy field
    const smmLinks = reqBody.map(item => ({
      ...item,
      publishDate,
    }));

    // Insert single or multiple
    await smmModel.insertMany(smmLinks);

    res.json({
      status: 'Success',
      message: `${smmLinks.length} Social Media Link(s) Added`,
    });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

// ✅ View all SMM links
export const viewSmmList = async (req, res) => {
  try {
    const result = await smmModel.find().populate('project', 'website');
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

// ✅ View links by project
export const viewSmmByProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await smmModel.find({ project: id })
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

// ✅ Update a link
export const updateSmmLink = async (req, res) => {
  try {
    const { id } = req.params;
    const reqBody = req.body;

    const updated = await smmModel.findByIdAndUpdate(id, reqBody, { new: true });
    if (!updated) return res.status(404).json({ status: 'Failed', message: 'SMM Link not found' });

    res.json({ status: 'Success', message: 'SMM Link Updated'});
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

// ✅ Delete a link
export const deleteSmmLink = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await smmModel.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ status: 'Failed', message: 'SMM Link not found' });

    res.json({ status: 'Success', message: 'SMM Link Deleted' });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

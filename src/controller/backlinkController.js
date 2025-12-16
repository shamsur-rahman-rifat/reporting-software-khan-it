import backlinkModel from '../model/Backlink.js';

export const addBacklink = async (req, res) => {
  try {
    const reqBody = req.body;
    const createdBy = req.headers['email']

    // Generate report month
    const now = new Date();
    const reportMonth = now.toLocaleString("en-US", { month: "long", year: "numeric" });    

    // Normalize input to always be an array
    if (!Array.isArray(reqBody)) {
      reqBody = [reqBody];
    }

    // Attach createdBy and ensure dateAdded is set
    const backlinks = reqBody.map(item => ({
      ...item,
      createdBy,
      reportMonth
    }));

    // Use insertMany for bulk or single insert
    await backlinkModel.insertMany(backlinks);

    res.json({
      status: 'Success',
      message: `${backlinks.length} Backlink(s) Added`,
    });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

export const viewBacklinkList = async (req, res) => {
  try {
    const result = await backlinkModel
      .find()
      .populate('project', 'website')

    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

export const updateBacklink = async (req, res) => {
  try {
    const reqBody = req.body;
    const { id } = req.params;

    await backlinkModel.updateOne({ _id: id }, reqBody);
    res.json({ status: 'Success', message: 'Backlink Updated' });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

export const deleteBacklink = async (req, res) => {
  try {
    const { id } = req.params;
    await backlinkModel.deleteOne({ _id: id });
    res.json({ status: 'Success', message: 'Backlink Deleted' });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

export const viewBacklinksByProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await backlinkModel
      .find({ project: id })
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

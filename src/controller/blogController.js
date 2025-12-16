import axios from "axios";
import cron from "node-cron";
import blogModel from "../model/Blog.js";

export const fetchAndSaveBlogs = async (req, res) => {
  try {
    // 1️⃣ Login to get token
    const loginResponse = await axios.post("https://khanit.xyz/api/login", {
      email: process.env.BLOG_API_EMAIL,
      password: process.env.BLOG_API_PASSWORD,
    });

    const token = loginResponse.data.token;
    if (!token) throw new Error("No token received from login API");

    // 2️⃣ Fetch published articles
    const { data } = await axios.get(
      "https://khanit.xyz/api/viewPublishedArticles",
      { headers: { token } }
    );

    const blogs = data?.data || [];
    if (!blogs.length) {
      if (res)
        return res.json({ status: "Success", message: "No blogs found from API" });
      else
        console.log("No blogs found from API");
      return;
    }

    // 3️⃣ Save new blogs only (skip duplicates)
    let addedCount = 0;
    for (const b of blogs) {
      const exists = await blogModel.findOne({ articleId: b.id });
      if (!exists) {
        await blogModel.create({
          articleId: b.id,
          project: b.projectName,
          topic: b.topicTitle,
          publishLink: b.publishLink,
          publishedAt: b.publishedAt,
        });
        addedCount++;
      }
    }

    const message = `${addedCount} new blog(s) added`;
    if (res) {
      res.json({ status: "Success", message });
    } else {
      console.log(`✅ Monthly fetch complete: ${message}`);
    }
  } catch (error) {
    const message = error.message || "Something went wrong";
    if (res) res.json({ status: "Failed", message });
    else console.error("❌ Monthly fetch failed:", message);
  }
};

export const viewBlogList = async (req, res) => {
  try {
    const result = await blogModel.find().sort({ publishedAt: -1 });
    res.json({ status: "Success", data: result });
  } catch (error) {
    res.json({ status: "Failed", message: error.message || error });
  }
};

export const viewBlogListByProject = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await blogModel
      .find({ project: name })
      .sort({ publishedAt: -1 });
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error.message || error });
  }
};

// 🕒 CRON JOB SETUP (run automatically on the first day of each month at midnight)
cron.schedule("0 0 1 * *", async () => {
  console.log("🚀 Running automatic monthly blog fetch...");
  await fetchAndSaveBlogs(); // no req/res since it’s auto
});

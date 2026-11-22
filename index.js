// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import { MongoClient, ObjectId } from "mongodb";

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "https://my-edunexa.vercel.app"],
//     methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
//     credentials: true,
//   }),
// );

// app.use(express.json());

// const mongoUri = process.env.MONGO_URI;
// if (!mongoUri) {
//   throw new Error("MONGO_URI is not configured");
// }

// const client = new MongoClient(mongoUri);

// export async function connectToMongoDB() {
//   try {
//     await client.connect();
//     console.log("You successfully connected to MongoDB!");
//     return client;
//   } catch (err) {
//     console.error("Failed to connect to MongoDB:", err);
//     throw err;
//   }
// }

// const connectedClient = await connectToMongoDB();
// const db = connectedClient.db("Edunexa");
// const users = db.collection("user");
// const allTuitions = db.collection("tuitions");
// const applications = db.collection("applications");
// const savedTuitions = db.collection("savedtuitions");
// const payments = db.collection("payments");

// const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// // Verify the logged-in user using Better Auth
// async function getAuthenticatedUser(req) {
//   try {
//     const cookie = req.headers.cookie;

//     if (!cookie) {
//       console.log("No authentication cookie received");
//       return null;
//     }

//     const response = await fetch(`${FRONTEND_URL}/api/auth/get-session`, {
//       method: "GET",
//       headers: {
//         cookie,
//       },
//     });

//     if (!response.ok) {
//       console.error("Better Auth session error:", response.status);
//       return null;
//     }

//     const sessionData = await response.json();

//     return sessionData?.user || null;
//   } catch (error) {
//     console.error("Authentication verification error:", error);
//     return null;
//   }
// }

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.get("/users", async (req, res) => {
//   const cursor = users.find({});
//   const result = await cursor.toArray();
//   res.send(result);
// });

// app.get("/all-tuitions", async (req, res) => {
//   try {
//     const result = await allTuitions.find({}).toArray();

//     console.log(result);

//     res.status(200).send(result);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ message: "Data fetching failed" });
//   }
// });

// // PUBLIC: 6 latest for home page (must be before /:id)
// // PUBLIC: 6 latest for home page
// // app.get("/all-tuitions/latest", async (req, res) => {
// //   try {
// //     const list = await tuitions
// //       .find({
// //         approvalStatus: "approved",
// //         isActive: true,
// //       })
// //       .sort({ createdAt: -1 })
// //       .limit(6)
// //       .toArray();

// //     res.status(200).send(list);
// //   } catch (error) {
// //     console.log(error);
// //     res.status(500).send({ message: "Data fetching failed" });
// //   }
// // });
// app.get("/all-tuitions/latest", async (req, res) => {
//   try {
//     const list = await allTuitions
//       .find({
//         status: "approved",
//         isActive: true,
//       })
//       .sort({ createdAt: -1 })
//       .limit(6)
//       .toArray();

//     res.status(200).send(list);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Data fetching failed",
//     });
//   }
// });

// // PUBLIC: details
// app.get("/all-tuitions/:id", async (req, res) => {
//   try {
//     if (!ObjectId.isValid(req.params.id)) {
//       return res.status(400).send({ message: "Invalid id" });
//     }

//     const tuition = await allTuitions.findOne({
//       _id: new ObjectId(req.params.id),
//     });

//     if (!tuition) {
//       return res.status(404).send({ message: "Tuition not found" });
//     }

//     res.status(200).send(tuition);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: "Failed to fetch tuition details",
//     });
//   }
// });

// // GET: Fetch applications submitted by a student
// app.get("/applications/student/:studentId", async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     const result = await applications
//       .find({ studentId })
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.status(200).send(result);
//   } catch (error) {
//     console.error("Error fetching student applications:", error);

//     res.status(500).send({
//       message: "Failed to fetch applications",
//     });
//   }
// });

// // Get student applications count
// app.get("/applications/student/:studentId/count", async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     const count = await applications.countDocuments({ studentId });

//     res.status(200).send({
//       count,
//     });
//   } catch (error) {
//     console.error("Error counting student applications:", error);

//     res.status(500).send({
//       message: "Failed to count applications",
//     });
//   }
// });

// // GET: Check whether a student has applied for a tuition
// app.get("/applications/check/:studentId/:tuitionId", async (req, res) => {
//   try {
//     const { studentId, tuitionId } = req.params;

//     const application = await applications.findOne({
//       studentId,
//       tuitionId,
//     });

//     res.status(200).send({
//       hasApplied: Boolean(application),
//     });
//   } catch (error) {
//     console.error("Application check error:", error);

//     res.status(500).send({
//       message: "Failed to check application status",
//     });
//   }
// });
// // POST: Submit tuition application
// app.post("/applications", async (req, res) => {
//   try {
//     const {
//       tuitionId,
//       studentId,
//       studentName,
//       studentEmail,
//       phone,
//       institution,
//       message,
//     } = req.body;

//     if (
//       !tuitionId ||
//       !studentId ||
//       !studentEmail ||
//       !phone ||
//       !institution ||
//       !message
//     ) {
//       return res.status(400).send({
//         message: "Please provide all required application details",
//       });
//     }

//     // Check whether this student has already applied
//     const existingApplication = await applications.findOne({
//       tuitionId,
//       studentId,
//     });

//     if (existingApplication) {
//       return res.status(409).send({
//         message: "You have already applied for this tuition",
//       });
//     }

//     // Fetch the tuition record
//     if (!ObjectId.isValid(tuitionId)) {
//       return res.status(400).send({ message: "Invalid tuition ID" });
//     }

//     const tuition = await allTuitions.findOne({
//       _id: new ObjectId(tuitionId),
//     });

//     if (!tuition) {
//       return res.status(404).send({ message: "Tuition not found" });
//     }

//     const application = {
//       tuitionId,
//       tuitionTitle: tuition.title || "",
//       subject: tuition.subject || "",
//       tutorName: tuition.tutorName || tuition.mentor?.name || "Not provided",
//       tutorEmail: tuition.tutorEmail || tuition.mentor?.email || "",
//       monthlyFee: tuition.monthlyFee ?? tuition.salary ?? tuition.fee ?? 0,
//       currency: tuition.currency || "USD",
//       studentId,
//       studentName,
//       studentEmail,
//       phone,
//       institution,
//       message,
//       status: "Pending",
//       createdAt: new Date(),
//     };

//     await applications.insertOne(application);

//     res.status(201).send({
//       message: "Application submitted successfully",
//     });
//   } catch (error) {
//     console.error("Application submission error:", error);

//     res.status(500).send({
//       message: "Failed to submit application",
//     });
//   }
// });

// // get the saved applications -

// // GET: Fetch all saved tuitions for a student
// app.get("/saved-tuitions/student/:studentId", async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     const saved = await savedTuitions
//       .find({ studentId })
//       .sort({ savedAt: -1 })
//       .toArray();

//     const tuitionIds = saved
//       .filter((item) => ObjectId.isValid(String(item.tuitionId)))
//       .map((item) => new ObjectId(String(item.tuitionId)));

//     const tuitions = await allTuitions
//       .find({ _id: { $in: tuitionIds } })
//       .toArray();

//     const tuitionMap = new Map(
//       tuitions.map((tuition) => [tuition._id.toString(), tuition]),
//     );

//     const result = saved.map((item) => ({
//       ...item,
//       tuition: tuitionMap.get(String(item.tuitionId)) || null,
//     }));

//     res.status(200).send({
//       count: result.length,
//       savedTuitions: result,
//     });
//   } catch (error) {
//     console.error("Error fetching saved tuitions:", error);

//     res.status(500).send({
//       message: "Failed to fetch saved tuitions",
//     });
//   }
// });

// // GET: Count saved tuitions for a student
// app.get("/saved-tuitions/student/:studentId/count", async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     const count = await savedTuitions.countDocuments({
//       studentId,
//     });

//     res.status(200).send({
//       count,
//     });
//   } catch (error) {
//     console.error("Error counting saved tuitions:", error);

//     res.status(500).send({
//       message: "Failed to count saved tuitions",
//     });
//   }
// });

// // post
// app.post("/saved-tuitions", async (req, res) => {
//   try {
//     const { studentId, studentEmail, tuitionId } = req.body;

//     if (!studentId || !studentEmail || !tuitionId) {
//       return res.status(400).send({
//         message: "Student ID, email and tuition ID are required",
//       });
//     }

//     if (!ObjectId.isValid(tuitionId)) {
//       return res.status(400).send({
//         message: "Invalid tuition ID",
//       });
//     }

//     // Check whether tuition exists
//     const tuition = await allTuitions.findOne({
//       _id: new ObjectId(tuitionId),
//     });

//     if (!tuition) {
//       return res.status(404).send({
//         message: "Tuition not found",
//       });
//     }

//     // Prevent duplicate bookmarks
//     const existing = await savedTuitions.findOne({
//       studentId,
//       tuitionId,
//     });

//     if (existing) {
//       return res.status(409).send({
//         message: "This tuition is already saved",
//       });
//     }

//     // Find student's subscription
//     const student = await users.findOne({
//       email: studentEmail,
//     });

//     const plan = student?.plan?.toLowerCase() || "free";

//     // Free students can save only 5 tuitions
//     const savedCount = await savedTuitions.countDocuments({
//       studentId,
//     });

//     if (plan !== "pro" && savedCount >= 5) {
//       return res.status(403).send({
//         message:
//           "Free students can save only 5 tuitions. Upgrade to Pro for unlimited bookmarks.",
//         limitReached: true,
//       });
//     }

//     const savedItem = {
//       studentId,
//       studentEmail,
//       tuitionId,
//       tuitionTitle: tuition.title || "",
//       savedAt: new Date(),
//     };

//     await savedTuitions.insertOne(savedItem);

//     res.status(201).send({
//       message: "Tuition saved successfully",
//       savedItem,
//       count: savedCount + 1,
//     });
//   } catch (error) {
//     console.error("Error saving tuition:", error);

//     res.status(500).send({
//       message: "Failed to save tuition",
//     });
//   }
// });

// app.delete("/saved-tuitions/:studentId/:tuitionId", async (req, res) => {
//   try {
//     const { studentId, tuitionId } = req.params;

//     const result = await savedTuitions.deleteOne({
//       studentId,
//       tuitionId,
//     });

//     if (result.deletedCount === 0) {
//       return res.status(404).send({
//         message: "Saved tuition not found",
//       });
//     }

//     res.status(200).send({
//       message: "Tuition removed from saved list",
//     });
//   } catch (error) {
//     console.error("Error removing saved tuition:", error);

//     res.status(500).send({
//       message: "Failed to remove saved tuition",
//     });
//   }
// });
// // GET: Current tutor's tuition posting statistics
// app.get("/tuitions/my/count", async (req, res) => {
//   try {
//     const user = await getAuthenticatedUser(req);

//     if (!user) {
//       return res.status(401).send({
//         message: "Please log in to continue",
//       });
//     }

//     if (user.role !== "tutor") {
//       return res.status(403).send({
//         message: "Only tutors can access this feature",
//       });
//     }

//     const email = user.email.toLowerCase();
//     const plan = String(user.plan || "free").toLowerCase();

//     const count = await allTuitions.countDocuments({
//       tutorEmail: email,
//     });

//     res.status(200).send({
//       count,
//       plan,
//       limit: plan === "pro" ? null : 2,
//       remaining: plan === "pro" ? null : Math.max(0, 2 - count),
//       canPost: plan === "pro" || count < 2,
//     });
//   } catch (error) {
//     console.error("Tuition statistics error:", error);

//     res.status(500).send({
//       message: "Failed to fetch tuition statistics",
//     });
//   }
// });

// // POST: Create a new tuition
// app.post("/tuitions", async (req, res) => {
//   try {
//     // 1. Verify Better Auth session
//     const user = await getAuthenticatedUser(req);

//     if (!user) {
//       return res.status(401).send({
//         message: "Please log in to post a tuition",
//       });
//     }

//     // 2. Verify tutor role
//     if (user.role !== "tutor") {
//       return res.status(403).send({
//         message: "Only tutors can post tuition",
//       });
//     }

//     const {
//       title,
//       subject,
//       classLevel,
//       mode,
//       location,
//       monthlyFee,
//       daysPerWeek,
//       description,
//       bannerImage,
//     } = req.body;

//     // 3. Validate required fields
//     if (
//       !title?.trim() ||
//       !subject?.trim() ||
//       !classLevel?.trim() ||
//       !mode ||
//       monthlyFee === undefined ||
//       daysPerWeek === undefined ||
//       !description?.trim() ||
//       !bannerImage
//     ) {
//       return res.status(400).send({
//         message: "Please fill in all required fields",
//       });
//     }

//     // 4. Validate lengths
//     if (title.trim().length < 5 || title.trim().length > 100) {
//       return res.status(400).send({
//         message: "Title must contain 5–100 characters",
//       });
//     }

//     if (description.trim().length < 20 || description.trim().length > 2000) {
//       return res.status(400).send({
//         message: "Description must contain 20–2000 characters",
//       });
//     }

//     // 5. Validate numbers
//     const fee = Number(monthlyFee);
//     const days = Number(daysPerWeek);

//     if (!Number.isFinite(fee) || fee <= 0 || fee > 10000000) {
//       return res.status(400).send({
//         message: "Enter a valid monthly fee",
//       });
//     }

//     if (!Number.isInteger(days) || days < 1 || days > 7) {
//       return res.status(400).send({
//         message: "Days per week must be between 1 and 7",
//       });
//     }

//     // 6. Validate mode
//     if (!["Online", "Offline", "Both"].includes(mode)) {
//       return res.status(400).send({
//         message: "Invalid tuition mode",
//       });
//     }

//     if (mode !== "Online" && !location?.trim()) {
//       return res.status(400).send({
//         message: "Location is required for offline tuition",
//       });
//     }

//     // 7. Validate ImgBB URL
//     let imageUrl;

//     try {
//       imageUrl = new URL(bannerImage);

//       if (
//         imageUrl.protocol !== "https:" ||
//         !["ibb.co", "i.ibb.co", "imgbb.com"].includes(imageUrl.hostname)
//       ) {
//         throw new Error("Invalid image host");
//       }
//     } catch {
//       return res.status(400).send({
//         message: "Please upload a valid ImgBB image",
//       });
//     }

//     // 8. Get authenticated tutor details
//     const tutorEmail = user.email.toLowerCase();
//     const tutorName = user.name || "Tutor";
//     const plan = String(user.plan || "free").toLowerCase();

//     // 9. Check existing posts
//     const existingCount = await allTuitions.countDocuments({
//       tutorEmail,
//     });

//     // 10. Enforce Free plan limit
//     if (plan !== "pro" && existingCount >= 2) {
//       return res.status(403).send({
//         message:
//           "Free tutors can create only 2 tuition posts. Upgrade to Pro for unlimited posts.",
//         limitReached: true,
//         currentCount: existingCount,
//       });
//     }

//     // 11. Create tuition
//     const newTuition = {
//       title: title.trim(),
//       subject: subject.trim(),
//       classLevel: classLevel.trim(),
//       mode,
//       location: mode === "Online" ? "" : location.trim(),
//       monthlyFee: fee,
//       currency: "USD",
//       daysPerWeek: days,
//       description: description.trim(),
//       bannerImage: bannerImage,
//       tutorName,
//       tutorEmail,
//       status: "pending",
//       isActive: true,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     const result = await allTuitions.insertOne(newTuition);

//     return res.status(201).send({
//       message: "Tuition submitted successfully for approval",
//       tuitionId: result.insertedId,
//       currentCount: existingCount + 1,
//       remaining: plan === "pro" ? null : Math.max(0, 2 - existingCount - 1),
//     });
//   } catch (error) {
//     console.error("Create tuition error:", error);

//     res.status(500).send({
//       message: "Failed to create tuition",
//     });
//   }
// });

// // ==========================================
// // TUTOR: GET MY TUITION POSTS
// // ==========================================
// app.get("/tuitions/my", async (req, res) => {
//   try {
//     const user = await getAuthenticatedUser(req);

//     if (!user) {
//       return res.status(401).send({ message: "Please log in" });
//     }

//     if (user.role !== "tutor") {
//       return res.status(403).send({ message: "Tutor access only" });
//     }

//     const result = await allTuitions
//       .find({ tutorEmail: user.email.toLowerCase() })
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.status(200).send(result);
//   } catch (error) {
//     console.error("My tuitions error:", error);
//     res.status(500).send({ message: "Failed to fetch tuitions" });
//   }
// });

// // ==========================================
// // TUTOR: DASHBOARD STATISTICS
// // ==========================================
// app.get("/tuitions/my/stats", async (req, res) => {
//   try {
//     const user = await getAuthenticatedUser(req);

//     if (!user) {
//       return res.status(401).send({ message: "Please log in" });
//     }

//     if (user.role !== "tutor") {
//       return res.status(403).send({ message: "Tutor access only" });
//     }

//     const tutorEmail = user.email.toLowerCase();

//     const totalTuitions = await allTuitions.countDocuments({
//       tutorEmail,
//     });

//     const activeTuitions = await allTuitions.countDocuments({
//       tutorEmail,
//       status: "approved",
//       isActive: true,
//     });

//     const tuitionIds = (
//       await allTuitions
//         .find({ tutorEmail }, { projection: { _id: 1 } })
//         .toArray()
//     ).map((item) => item._id.toString());

//     const totalApplicants = await applications.countDocuments({
//       tuitionId: { $in: tuitionIds },
//     });

//     res.status(200).send({
//       totalTuitions,
//       activeTuitions,
//       totalApplicants,
//       plan: String(user.plan || "free").toLowerCase(),
//     });
//   } catch (error) {
//     console.error("Tutor stats error:", error);
//     res.status(500).send({ message: "Failed to fetch tutor statistics" });
//   }
// });

// // ==========================================
// // TUTOR: EDIT TUITION
// // ==========================================
// app.put("/tuitions/:id", async (req, res) => {
//   try {
//     const user = await getAuthenticatedUser(req);

//     if (!user) {
//       return res.status(401).send({ message: "Please log in" });
//     }

//     if (user.role !== "tutor") {
//       return res.status(403).send({ message: "Tutor access only" });
//     }

//     const { id } = req.params;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).send({ message: "Invalid tuition ID" });
//     }

//     const {
//       title,
//       subject,
//       classLevel,
//       mode,
//       location,
//       monthlyFee,
//       daysPerWeek,
//       description,
//       bannerImage,
//     } = req.body;

//     if (
//       !title?.trim() ||
//       !subject?.trim() ||
//       !classLevel?.trim() ||
//       !["Online", "Offline", "Both"].includes(mode) ||
//       !description?.trim()
//     ) {
//       return res.status(400).send({
//         message: "Please provide all required tuition details",
//       });
//     }

//     const fee = Number(monthlyFee);
//     const days = Number(daysPerWeek);

//     if (
//       !Number.isFinite(fee) ||
//       fee <= 0 ||
//       fee > 10000000 ||
//       !Number.isInteger(days) ||
//       days < 1 ||
//       days > 7
//     ) {
//       return res.status(400).send({
//         message: "Invalid fee or days per week",
//       });
//     }

//     if (title.trim().length < 5 || title.trim().length > 100) {
//       return res.status(400).send({
//         message: "Title must contain 5–100 characters",
//       });
//     }

//     if (description.trim().length < 20 || description.trim().length > 2000) {
//       return res.status(400).send({
//         message: "Description must contain 20–2000 characters",
//       });
//     }

//     if (mode !== "Online" && !location?.trim()) {
//       return res.status(400).send({
//         message: "Location is required for offline tuition",
//       });
//     }

//     const existing = await allTuitions.findOne({
//       _id: new ObjectId(id),
//       tutorEmail: user.email.toLowerCase(),
//     });

//     if (!existing) {
//       return res.status(404).send({
//         message: "Tuition not found or access denied",
//       });
//     }

//     let updatedBanner = existing.bannerImage;

//     if (bannerImage !== undefined && bannerImage !== existing.bannerImage) {
//       try {
//         const imageUrl = new URL(bannerImage);

//         if (
//           imageUrl.protocol !== "https:" ||
//           !["ibb.co", "i.ibb.co", "imgbb.com"].includes(imageUrl.hostname)
//         ) {
//           throw new Error("Invalid image host");
//         }

//         updatedBanner = bannerImage;
//       } catch {
//         return res.status(400).send({
//           message: "Invalid ImgBB image URL",
//         });
//       }
//     }

//     await allTuitions.updateOne(
//       {
//         _id: new ObjectId(id),
//         tutorEmail: user.email.toLowerCase(),
//       },
//       {
//         $set: {
//           title: title.trim(),
//           subject: subject.trim(),
//           classLevel: classLevel.trim(),
//           mode,
//           location: mode === "Online" ? "" : location.trim(),
//           monthlyFee: fee,
//           daysPerWeek: days,
//           description: description.trim(),
//           bannerImage: updatedBanner,
//           updatedAt: new Date(),
//         },
//       },
//     );

//     res.status(200).send({
//       message: "Tuition updated successfully",
//     });
//   } catch (error) {
//     console.error("Update tuition error:", error);
//     res.status(500).send({ message: "Failed to update tuition" });
//   }
// });

// // ==========================================
// // TUTOR: DELETE TUITION
// // ==========================================
// app.delete("/tuitions/:id", async (req, res) => {
//   try {
//     const user = await getAuthenticatedUser(req);

//     if (!user) {
//       return res.status(401).send({ message: "Please log in" });
//     }

//     if (user.role !== "tutor") {
//       return res.status(403).send({ message: "Tutor access only" });
//     }

//     const { id } = req.params;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).send({ message: "Invalid tuition ID" });
//     }

//     const tuition = await allTuitions.findOne({
//       _id: new ObjectId(id),
//       tutorEmail: user.email.toLowerCase(),
//     });

//     if (!tuition) {
//       return res.status(404).send({ message: "Tuition not found" });
//     }

//     await allTuitions.deleteOne({ _id: tuition._id });

//     // Remove associated applications and bookmarks.
//     await applications.deleteMany({
//       tuitionId: id,
//     });

//     await savedTuitions.deleteMany({
//       tuitionId: id,
//     });

//     res.status(200).send({
//       message: "Tuition and associated records deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete tuition error:", error);
//     res.status(500).send({ message: "Failed to delete tuition" });
//   }
// });

// // ==========================================
// // TUTOR: TOGGLE ACTIVE / CLOSED
// // ==========================================
// app.patch("/tuitions/:id/status", async (req, res) => {
//   try {
//     const user = await getAuthenticatedUser(req);

//     if (!user) {
//       return res.status(401).send({ message: "Please log in" });
//     }

//     if (user.role !== "tutor") {
//       return res.status(403).send({ message: "Tutor access only" });
//     }

//     const { id } = req.params;
//     const { isActive } = req.body;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).send({ message: "Invalid tuition ID" });
//     }

//     if (typeof isActive !== "boolean") {
//       return res.status(400).send({
//         message: "isActive must be true or false",
//       });
//     }

//     const result = await allTuitions.updateOne(
//       {
//         _id: new ObjectId(id),
//         tutorEmail: user.email.toLowerCase(),
//       },
//       {
//         $set: {
//           isActive,
//           updatedAt: new Date(),
//         },
//       },
//     );

//     if (!result.matchedCount) {
//       return res.status(404).send({ message: "Tuition not found" });
//     }

//     res.status(200).send({
//       message: isActive ? "Tuition activated" : "Tuition closed",
//       isActive,
//     });
//   } catch (error) {
//     console.error("Toggle tuition error:", error);
//     res.status(500).send({ message: "Failed to update tuition status" });
//   }
// });

// // ==========================================
// // TUTOR: GET ALL APPLICANTS
// // ==========================================
// app.get("/tutor/applicants", async (req, res) => {
//   try {
//     const user = await getAuthenticatedUser(req);

//     if (!user) {
//       return res.status(401).send({ message: "Please log in" });
//     }

//     if (user.role !== "tutor") {
//       return res.status(403).send({ message: "Tutor access only" });
//     }

//     const tutorEmail = user.email.toLowerCase();

//     const result = await applications
//       .find({ tutorEmail })
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.status(200).send(result);
//   } catch (error) {
//     console.error("Fetch applicants error:", error);
//     res.status(500).send({ message: "Failed to fetch applicants" });
//   }
// });

// // ==========================================
// // TUTOR: ACCEPT / REJECT APPLICATION
// // ==========================================
// app.patch("/applications/:id/status", async (req, res) => {
//   try {
//     const user = await getAuthenticatedUser(req);

//     if (!user) {
//       return res.status(401).send({ message: "Please log in" });
//     }

//     if (user.role !== "tutor") {
//       return res.status(403).send({ message: "Tutor access only" });
//     }

//     const { id } = req.params;
//     const { status } = req.body;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).send({ message: "Invalid application ID" });
//     }

//     const normalizedStatus = String(status || "").toLowerCase();

//     if (!["accepted", "rejected"].includes(normalizedStatus)) {
//       return res.status(400).send({
//         message: "Status must be accepted or rejected",
//       });
//     }

//     const result = await applications.updateOne(
//       {
//         _id: new ObjectId(id),
//         tutorEmail: user.email.toLowerCase(),
//       },
//       {
//         $set: {
//           status: normalizedStatus,
//           updatedAt: new Date(),
//         },
//       },
//     );

//     if (!result.matchedCount) {
//       return res.status(404).send({
//         message: "Application not found or access denied",
//       });
//     }

//     res.status(200).send({
//       message: `Application ${normalizedStatus} successfully`,
//       status: normalizedStatus,
//     });
//   } catch (error) {
//     console.error("Update application status error:", error);
//     res.status(500).send({
//       message: "Failed to update application status",
//     });
//   }
// });

// // POST: Confirm successful Stripe payment and upgrade user to Pro
// app.post("/payments/confirm", async (req, res) => {
//   try {
//     const { sessionId } = req.body;

//     if (!sessionId) {
//       return res.status(400).send({
//         message: "Stripe session ID is required",
//       });
//     }

//     // Verify the Checkout Session directly with Stripe
//     const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

//     if (checkoutSession.mode !== "subscription") {
//       return res.status(400).send({
//         message: "Invalid subscription checkout",
//       });
//     }

//     if (checkoutSession.payment_status !== "paid") {
//       return res.status(400).send({
//         message: "Payment has not been completed",
//       });
//     }

//     const userId = checkoutSession.client_reference_id;
//     const role = checkoutSession.metadata?.role;

//     if (!userId || !["student", "tutor"].includes(role)) {
//       return res.status(400).send({
//         message: "Invalid user or subscription details",
//       });
//     }

//     // Support ObjectId and string IDs
//     const userFilter = ObjectId.isValid(userId)
//       ? {
//           $or: [{ _id: new ObjectId(userId) }, { _id: userId }],
//         }
//       : { _id: userId };

//     const userUpdate = await users.updateOne(userFilter, {
//       $set: {
//         plan: "pro",
//         subscriptionStatus: "active",
//         stripeCustomerId: checkoutSession.customer,
//         stripeSubscriptionId: checkoutSession.subscription,
//         updatedAt: new Date(),
//       },
//     });

//     if (userUpdate.matchedCount === 0) {
//       return res.status(404).send({
//         message: "User not found",
//       });
//     }

//     // Save payment once; repeated requests won't create duplicates
//     await payments.updateOne(
//       { stripeSessionId: checkoutSession.id },
//       {
//         $setOnInsert: {
//           userId,
//           role,
//           stripeSessionId: checkoutSession.id,
//           stripeCustomerId: checkoutSession.customer,
//           stripeSubscriptionId: checkoutSession.subscription,
//           amount: (checkoutSession.amount_total || 0) / 100,
//           currency: checkoutSession.currency,
//           status: "paid",
//           paymentDate: new Date(),
//           createdAt: new Date(),
//         },
//       },
//       { upsert: true },
//     );

//     return res.status(200).send({
//       success: true,
//       message: "Payment confirmed. Your plan is now Pro.",
//       plan: "pro",
//     });
//   } catch (error) {
//     console.error("Payment confirmation error:", error);

//     return res.status(500).send({
//       message: "Unable to confirm payment",
//     });
//   }
// });

// new code --
import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://my-edunexa.vercel.app"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  }),
);

app.use(express.json());

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error("MONGO_URI is not configured");
}

const client = new MongoClient(mongoUri);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
}

const connectedClient = await connectToMongoDB();
const db = connectedClient.db("Edunexa");
const users = db.collection("user");
const allTuitions = db.collection("tuitions");
const applications = db.collection("applications");
const savedTuitions = db.collection("savedtuitions");
const payments = db.collection("payments");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async (req, res) => {
  const cursor = users.find({});
  const result = await cursor.toArray();
  res.send(result);
});

app.get("/all-tuitions", async (req, res) => {
  try {
    const result = await allTuitions.find({}).toArray();

    console.log(result);

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Data fetching failed" });
  }
});

// PUBLIC: 6 latest for home page (must be before /:id)
app.get("/all-tuitions/latest", async (req, res) => {
  try {
    const list = await allTuitions
      .find({
        status: "approved",
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    res.status(200).send(list);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Data fetching failed",
    });
  }
});

// PUBLIC: details
app.get("/all-tuitions/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: "Invalid id" });
    }

    const tuition = await allTuitions.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!tuition) {
      return res.status(404).send({ message: "Tuition not found" });
    }

    res.status(200).send(tuition);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to fetch tuition details",
    });
  }
});

// GET: Fetch applications submitted by a student
app.get("/applications/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await applications
      .find({ studentId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching student applications:", error);

    res.status(500).send({
      message: "Failed to fetch applications",
    });
  }
});

// Get student applications count
app.get("/applications/student/:studentId/count", async (req, res) => {
  try {
    const { studentId } = req.params;

    const count = await applications.countDocuments({ studentId });

    res.status(200).send({
      count,
    });
  } catch (error) {
    console.error("Error counting student applications:", error);

    res.status(500).send({
      message: "Failed to count applications",
    });
  }
});

// GET: Check whether a student has applied for a tuition
app.get("/applications/check/:studentId/:tuitionId", async (req, res) => {
  try {
    const { studentId, tuitionId } = req.params;

    const application = await applications.findOne({
      studentId,
      tuitionId,
    });

    res.status(200).send({
      hasApplied: Boolean(application),
    });
  } catch (error) {
    console.error("Application check error:", error);

    res.status(500).send({
      message: "Failed to check application status",
    });
  }
});

// POST: Submit tuition application
app.post("/applications", async (req, res) => {
  try {
    const {
      tuitionId,
      studentId,
      studentName,
      studentEmail,
      phone,
      institution,
      message,
    } = req.body;

    if (
      !tuitionId ||
      !studentId ||
      !studentEmail ||
      !phone ||
      !institution ||
      !message
    ) {
      return res.status(400).send({
        message: "Please provide all required application details",
      });
    }

    // Check whether this student has already applied
    const existingApplication = await applications.findOne({
      tuitionId,
      studentId,
    });

    if (existingApplication) {
      return res.status(409).send({
        message: "You have already applied for this tuition",
      });
    }

    // Fetch the tuition record
    if (!ObjectId.isValid(tuitionId)) {
      return res.status(400).send({ message: "Invalid tuition ID" });
    }

    const tuition = await allTuitions.findOne({
      _id: new ObjectId(tuitionId),
    });

    if (!tuition) {
      return res.status(404).send({ message: "Tuition not found" });
    }

    const application = {
      tuitionId,
      tuitionTitle: tuition.title || "",
      subject: tuition.subject || "",
      tutorName: tuition.tutorName || tuition.mentor?.name || "Not provided",
      tutorEmail: tuition.tutorEmail || tuition.mentor?.email || "",
      monthlyFee: tuition.monthlyFee ?? tuition.salary ?? tuition.fee ?? 0,
      currency: tuition.currency || "USD",
      studentId,
      studentName,
      studentEmail,
      phone,
      institution,
      message,
      status: "Pending",
      createdAt: new Date(),
    };

    await applications.insertOne(application);

    res.status(201).send({
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Application submission error:", error);

    res.status(500).send({
      message: "Failed to submit application",
    });
  }
});

// GET: Fetch all saved tuitions for a student
app.get("/saved-tuitions/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const saved = await savedTuitions
      .find({ studentId })
      .sort({ savedAt: -1 })
      .toArray();

    const tuitionIds = saved
      .filter((item) => ObjectId.isValid(String(item.tuitionId)))
      .map((item) => new ObjectId(String(item.tuitionId)));

    const tuitions = await allTuitions
      .find({ _id: { $in: tuitionIds } })
      .toArray();

    const tuitionMap = new Map(
      tuitions.map((tuition) => [tuition._id.toString(), tuition]),
    );

    const result = saved.map((item) => ({
      ...item,
      tuition: tuitionMap.get(String(item.tuitionId)) || null,
    }));

    res.status(200).send({
      count: result.length,
      savedTuitions: result,
    });
  } catch (error) {
    console.error("Error fetching saved tuitions:", error);

    res.status(500).send({
      message: "Failed to fetch saved tuitions",
    });
  }
});

// GET: Count saved tuitions for a student
app.get("/saved-tuitions/student/:studentId/count", async (req, res) => {
  try {
    const { studentId } = req.params;

    const count = await savedTuitions.countDocuments({
      studentId,
    });

    res.status(200).send({
      count,
    });
  } catch (error) {
    console.error("Error counting saved tuitions:", error);

    res.status(500).send({
      message: "Failed to count saved tuitions",
    });
  }
});

// POST: Save tuition
app.post("/saved-tuitions", async (req, res) => {
  try {
    const { studentId, studentEmail, tuitionId } = req.body;

    if (!studentId || !studentEmail || !tuitionId) {
      return res.status(400).send({
        message: "Student ID, email and tuition ID are required",
      });
    }

    if (!ObjectId.isValid(tuitionId)) {
      return res.status(400).send({
        message: "Invalid tuition ID",
      });
    }

    // Check whether tuition exists
    const tuition = await allTuitions.findOne({
      _id: new ObjectId(tuitionId),
    });

    if (!tuition) {
      return res.status(404).send({
        message: "Tuition not found",
      });
    }

    // Prevent duplicate bookmarks
    const existing = await savedTuitions.findOne({
      studentId,
      tuitionId,
    });

    if (existing) {
      return res.status(409).send({
        message: "This tuition is already saved",
      });
    }

    // Find student's subscription
    const student = await users.findOne({
      email: studentEmail,
    });

    const plan = student?.plan?.toLowerCase() || "free";

    // Free students can save only 5 tuitions
    const savedCount = await savedTuitions.countDocuments({
      studentId,
    });

    if (plan !== "pro" && savedCount >= 5) {
      return res.status(403).send({
        message:
          "Free students can save only 5 tuitions. Upgrade to Pro for unlimited bookmarks.",
        limitReached: true,
      });
    }

    const savedItem = {
      studentId,
      studentEmail,
      tuitionId,
      tuitionTitle: tuition.title || "",
      savedAt: new Date(),
    };

    await savedTuitions.insertOne(savedItem);

    res.status(201).send({
      message: "Tuition saved successfully",
      savedItem,
      count: savedCount + 1,
    });
  } catch (error) {
    console.error("Error saving tuition:", error);

    res.status(500).send({
      message: "Failed to save tuition",
    });
  }
});

app.delete("/saved-tuitions/:studentId/:tuitionId", async (req, res) => {
  try {
    const { studentId, tuitionId } = req.params;

    const result = await savedTuitions.deleteOne({
      studentId,
      tuitionId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: "Saved tuition not found",
      });
    }

    res.status(200).send({
      message: "Tuition removed from saved list",
    });
  } catch (error) {
    console.error("Error removing saved tuition:", error);

    res.status(500).send({
      message: "Failed to remove saved tuition",
    });
  }
});

// GET: Tutor tuition posting statistics
app.get("/tuitions/my/count", async (req, res) => {
  try {
    const email = String(req.query.email || "")
      .trim()
      .toLowerCase();
    const filter = email ? { tutorEmail: email } : {};

    const count = await allTuitions.countDocuments(filter);
    const userDoc = email ? await users.findOne({ email }) : null;
    const plan = String(
      req.query.plan || userDoc?.plan || "free",
    ).toLowerCase();

    res.status(200).send({
      count,
      plan,
      limit: plan === "pro" ? null : 2,
      remaining: plan === "pro" ? null : Math.max(0, 2 - count),
      canPost: plan === "pro" || count < 2,
    });
  } catch (error) {
    console.error("Tuition statistics error:", error);

    res.status(500).send({
      message: "Failed to fetch tuition statistics",
    });
  }
});

// POST: Create a new tuition
app.post("/tuitions", async (req, res) => {
  try {
    const {
      title,
      subject,
      classLevel,
      mode,
      location,
      monthlyFee,
      daysPerWeek,
      description,
      bannerImage,
      tutorName,
      tutorEmail,
      plan: bodyPlan,
    } = req.body;

    // 1. Validate required fields
    if (
      !title?.trim() ||
      !subject?.trim() ||
      !classLevel?.trim() ||
      !mode ||
      monthlyFee === undefined ||
      daysPerWeek === undefined ||
      !description?.trim() ||
      !bannerImage
    ) {
      return res.status(400).send({
        message: "Please fill in all required fields",
      });
    }

    // 2. Validate lengths
    if (title.trim().length < 5 || title.trim().length > 100) {
      return res.status(400).send({
        message: "Title must contain 5–100 characters",
      });
    }

    if (description.trim().length < 20 || description.trim().length > 2000) {
      return res.status(400).send({
        message: "Description must contain 20–2000 characters",
      });
    }

    // 3. Validate numbers
    const fee = Number(monthlyFee);
    const days = Number(daysPerWeek);

    if (!Number.isFinite(fee) || fee <= 0 || fee > 10000000) {
      return res.status(400).send({
        message: "Enter a valid monthly fee",
      });
    }

    if (!Number.isInteger(days) || days < 1 || days > 7) {
      return res.status(400).send({
        message: "Days per week must be between 1 and 7",
      });
    }

    // 4. Validate mode
    if (!["Online", "Offline", "Both"].includes(mode)) {
      return res.status(400).send({
        message: "Invalid tuition mode",
      });
    }

    if (mode !== "Online" && !location?.trim()) {
      return res.status(400).send({
        message: "Location is required for offline tuition",
      });
    }

    // 5. Validate ImgBB URL
    try {
      const imageUrl = new URL(bannerImage);

      if (
        imageUrl.protocol !== "https:" ||
        !["ibb.co", "i.ibb.co", "imgbb.com"].includes(imageUrl.hostname)
      ) {
        throw new Error("Invalid image host");
      }
    } catch {
      return res.status(400).send({
        message: "Please upload a valid ImgBB image",
      });
    }

    // 6. Resolve tutor details without session auth
    const normalizedEmail = String(tutorEmail || "")
      .trim()
      .toLowerCase();
    const resolvedName = String(tutorName || "").trim() || "Tutor";
    const userDoc = normalizedEmail
      ? await users.findOne({ email: normalizedEmail })
      : null;
    const plan = String(bodyPlan || userDoc?.plan || "free").toLowerCase();

    // 7. Check existing posts if email is provided
    const existingCount = normalizedEmail
      ? await allTuitions.countDocuments({ tutorEmail: normalizedEmail })
      : 0;

    // 8. Enforce Free plan limit
    if (plan !== "pro" && existingCount >= 2) {
      return res.status(403).send({
        message:
          "Free tutors can create only 2 tuition posts. Upgrade to Pro for unlimited posts.",
        limitReached: true,
        currentCount: existingCount,
      });
    }

    // 9. Create tuition
    const newTuition = {
      title: title.trim(),
      subject: subject.trim(),
      classLevel: classLevel.trim(),
      mode,
      location: mode === "Online" ? "" : location.trim(),
      monthlyFee: fee,
      currency: "USD",
      daysPerWeek: days,
      description: description.trim(),
      bannerImage: bannerImage,
      tutorName: resolvedName,
      tutorEmail: normalizedEmail,
      status: "pending",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await allTuitions.insertOne(newTuition);

    return res.status(201).send({
      message: "Tuition submitted successfully for approval",
      tuitionId: result.insertedId,
      currentCount: existingCount + 1,
      remaining: plan === "pro" ? null : Math.max(0, 2 - existingCount - 1),
    });
  } catch (error) {
    console.error("Create tuition error:", error);

    res.status(500).send({
      message: "Failed to create tuition",
    });
  }
});

// ==========================================
// TUTOR: GET MY TUITION POSTS
// ==========================================
app.get("/tuitions/my", async (req, res) => {
  try {
    const email = String(req.query.email || "")
      .trim()
      .toLowerCase();
    const filter = email ? { tutorEmail: email } : {};

    const result = await allTuitions
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error("My tuitions error:", error);
    res.status(500).send({ message: "Failed to fetch tuitions" });
  }
});

// ==========================================
// TUTOR: DASHBOARD STATISTICS
// ==========================================
app.get("/tuitions/my/stats", async (req, res) => {
  try {
    const email = String(req.query.email || "")
      .trim()
      .toLowerCase();
    const filter = email ? { tutorEmail: email } : {};

    const totalTuitions = await allTuitions.countDocuments(filter);

    const activeTuitions = await allTuitions.countDocuments({
      ...filter,
      status: "approved",
      isActive: true,
    });

    const tuitionIds = (
      await allTuitions.find(filter, { projection: { _id: 1 } }).toArray()
    ).map((item) => item._id.toString());

    const totalApplicants =
      email && tuitionIds.length === 0
        ? 0
        : await applications.countDocuments(
            email ? { tuitionId: { $in: tuitionIds } } : {},
          );

    const userDoc = email ? await users.findOne({ email }) : null;

    res.status(200).send({
      totalTuitions,
      activeTuitions,
      totalApplicants,
      plan: String(req.query.plan || userDoc?.plan || "free").toLowerCase(),
    });
  } catch (error) {
    console.error("Tutor stats error:", error);
    res.status(500).send({ message: "Failed to fetch tutor statistics" });
  }
});

// ==========================================
// TUTOR: EDIT TUITION
// ==========================================
app.put("/tuitions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid tuition ID" });
    }

    const {
      title,
      subject,
      classLevel,
      mode,
      location,
      monthlyFee,
      daysPerWeek,
      description,
      bannerImage,
    } = req.body;

    if (
      !title?.trim() ||
      !subject?.trim() ||
      !classLevel?.trim() ||
      !["Online", "Offline", "Both"].includes(mode) ||
      !description?.trim()
    ) {
      return res.status(400).send({
        message: "Please provide all required tuition details",
      });
    }

    const fee = Number(monthlyFee);
    const days = Number(daysPerWeek);

    if (
      !Number.isFinite(fee) ||
      fee <= 0 ||
      fee > 10000000 ||
      !Number.isInteger(days) ||
      days < 1 ||
      days > 7
    ) {
      return res.status(400).send({
        message: "Invalid fee or days per week",
      });
    }

    if (title.trim().length < 5 || title.trim().length > 100) {
      return res.status(400).send({
        message: "Title must contain 5–100 characters",
      });
    }

    if (description.trim().length < 20 || description.trim().length > 2000) {
      return res.status(400).send({
        message: "Description must contain 20–2000 characters",
      });
    }

    if (mode !== "Online" && !location?.trim()) {
      return res.status(400).send({
        message: "Location is required for offline tuition",
      });
    }

    const existing = await allTuitions.findOne({
      _id: new ObjectId(id),
    });

    if (!existing) {
      return res.status(404).send({
        message: "Tuition not found",
      });
    }

    let updatedBanner = existing.bannerImage;

    if (bannerImage !== undefined && bannerImage !== existing.bannerImage) {
      try {
        const imageUrl = new URL(bannerImage);

        if (
          imageUrl.protocol !== "https:" ||
          !["ibb.co", "i.ibb.co", "imgbb.com"].includes(imageUrl.hostname)
        ) {
          throw new Error("Invalid image host");
        }

        updatedBanner = bannerImage;
      } catch {
        return res.status(400).send({
          message: "Invalid ImgBB image URL",
        });
      }
    }

    await allTuitions.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          title: title.trim(),
          subject: subject.trim(),
          classLevel: classLevel.trim(),
          mode,
          location: mode === "Online" ? "" : location.trim(),
          monthlyFee: fee,
          daysPerWeek: days,
          description: description.trim(),
          bannerImage: updatedBanner,
          updatedAt: new Date(),
        },
      },
    );

    res.status(200).send({
      message: "Tuition updated successfully",
    });
  } catch (error) {
    console.error("Update tuition error:", error);
    res.status(500).send({ message: "Failed to update tuition" });
  }
});

// ==========================================
// TUTOR: DELETE TUITION
// ==========================================
app.delete("/tuitions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid tuition ID" });
    }

    const tuition = await allTuitions.findOne({
      _id: new ObjectId(id),
    });

    if (!tuition) {
      return res.status(404).send({ message: "Tuition not found" });
    }

    await allTuitions.deleteOne({ _id: tuition._id });

    // Remove associated applications and bookmarks.
    await applications.deleteMany({
      tuitionId: id,
    });

    await savedTuitions.deleteMany({
      tuitionId: id,
    });

    res.status(200).send({
      message: "Tuition and associated records deleted successfully",
    });
  } catch (error) {
    console.error("Delete tuition error:", error);
    res.status(500).send({ message: "Failed to delete tuition" });
  }
});

// ==========================================
// TUTOR: TOGGLE ACTIVE / CLOSED
// ==========================================
app.patch("/tuitions/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid tuition ID" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).send({
        message: "isActive must be true or false",
      });
    }

    const result = await allTuitions.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          isActive,
          updatedAt: new Date(),
        },
      },
    );

    if (!result.matchedCount) {
      return res.status(404).send({ message: "Tuition not found" });
    }

    res.status(200).send({
      message: isActive ? "Tuition activated" : "Tuition closed",
      isActive,
    });
  } catch (error) {
    console.error("Toggle tuition error:", error);
    res.status(500).send({ message: "Failed to update tuition status" });
  }
});

// ==========================================
// TUTOR: GET ALL APPLICANTS
// ==========================================
app.get("/tutor/applicants", async (req, res) => {
  try {
    const email = String(req.query.email || "")
      .trim()
      .toLowerCase();
    const filter = email ? { tutorEmail: email } : {};

    const result = await applications
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error("Fetch applicants error:", error);
    res.status(500).send({ message: "Failed to fetch applicants" });
  }
});

// ==========================================
// TUTOR: ACCEPT / REJECT APPLICATION
// ==========================================
app.patch("/applications/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid application ID" });
    }

    const normalizedStatus = String(status || "").toLowerCase();

    if (!["accepted", "rejected"].includes(normalizedStatus)) {
      return res.status(400).send({
        message: "Status must be accepted or rejected",
      });
    }

    const result = await applications.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status: normalizedStatus,
          updatedAt: new Date(),
        },
      },
    );

    if (!result.matchedCount) {
      return res.status(404).send({
        message: "Application not found",
      });
    }

    res.status(200).send({
      message: `Application ${normalizedStatus} successfully`,
      status: normalizedStatus,
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).send({
      message: "Failed to update application status",
    });
  }
});

// POST: Confirm successful Stripe payment and upgrade user to Pro
app.post("/payments/confirm", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).send({
        message: "Stripe session ID is required",
      });
    }

    // Verify the Checkout Session directly with Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.mode !== "subscription") {
      return res.status(400).send({
        message: "Invalid subscription checkout",
      });
    }

    if (checkoutSession.payment_status !== "paid") {
      return res.status(400).send({
        message: "Payment has not been completed",
      });
    }

    const userId = checkoutSession.client_reference_id;
    const role = checkoutSession.metadata?.role;

    if (!userId || !["student", "tutor"].includes(role)) {
      return res.status(400).send({
        message: "Invalid user or subscription details",
      });
    }

    // Support ObjectId and string IDs
    const userFilter = ObjectId.isValid(userId)
      ? {
          $or: [{ _id: new ObjectId(userId) }, { _id: userId }],
        }
      : { _id: userId };

    const userUpdate = await users.updateOne(userFilter, {
      $set: {
        plan: "pro",
        subscriptionStatus: "active",
        stripeCustomerId: checkoutSession.customer,
        stripeSubscriptionId: checkoutSession.subscription,
        updatedAt: new Date(),
      },
    });

    if (userUpdate.matchedCount === 0) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    // Save payment once; repeated requests won't create duplicates
    await payments.updateOne(
      { stripeSessionId: checkoutSession.id },
      {
        $setOnInsert: {
          userId,
          role,
          stripeSessionId: checkoutSession.id,
          stripeCustomerId: checkoutSession.customer,
          stripeSubscriptionId: checkoutSession.subscription,
          amount: (checkoutSession.amount_total || 0) / 100,
          currency: checkoutSession.currency,
          status: "paid",
          paymentDate: new Date(),
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    return res.status(200).send({
      success: true,
      message: "Payment confirmed. Your plan is now Pro.",
      plan: "pro",
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);

    return res.status(500).send({
      message: "Unable to confirm payment",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// // ROLE CHECK: tutor. Own tuitions only (must be before /:id)
// // app.get("/tutor/tuitions", verifyToken, verifyTutor, async (req, res) => {
// //   const list = await tuitions
// //     .find({ tutorEmail: req.user.email })
// //     .sort({ createdAt: -1 })
// //     .toArray();
// //   res.send(list);
// // });

// // PUBLIC: details
// app.get("/tuitions/:id", async (req, res) => {
//   if (!isValidId(req.params.id)) {
//     return res.status(400).send({ message: "Invalid id" });
//   }
//   const tuition = await tuitions.findOne({ _id: new ObjectId(req.params.id) });
//   if (!tuition) return res.status(404).send({ message: "Not found" });
//   res.send(tuition);
// });

// // ROLE CHECK: tutor. Free plan limit = 2 posts
// app.post("/tuitions", verifyTutor, async (req, res) => {
//   const count = await tuitions.countDocuments({ tutorEmail: req.user.email });
//   if (req.user.plan !== "pro" && count >= 2) {
//     return res
//       .status(403)
//       .send({ message: "Free plan limit reached. Upgrade to Pro." });
//   }
//   const {
//     title,
//     subject,
//     classLevel,
//     mode,
//     location,
//     monthlyFee,
//     daysPerWeek,
//     bannerImage,
//     description,
//   } = req.body;

//   const doc = {
//     title,
//     subject,
//     classLevel,
//     mode,
//     location,
//     monthlyFee: Number(monthlyFee),
//     daysPerWeek: Number(daysPerWeek),
//     bannerImage,
//     description,
//     tutorName: req.user.name,
//     tutorEmail: req.user.email, // always from the token, never from the body
//     approvalStatus: "pending",
//     isActive: true,
//     createdAt: new Date(),
//   };
//   const result = await tuitions.insertOne(doc);
//   res.send(result);
// });

// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import { MongoClient, ObjectId } from "mongodb";

// const app = express();
// const port = process.env.PORT || 5000;
// const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// // ---------- CORS ----------
// app.use(
//   cors({
//     origin: [CLIENT_URL, "http://localhost:3000"],
//     credentials: true,
//   }),
// );

// app.use(express.json());

// // ---------- MongoDB ----------
// const mongoUri = process.env.MONGO_URI;
// if (!mongoUri) throw new Error("MONGO_URI is not configured");

// const client = new MongoClient(mongoUri);

// export async function connectToMongoDB() {
//   try {
//     await client.connect();
//     console.log("You successfully connected to MongoDB!");
//     return client;
//   } catch (err) {
//     console.error("Failed to connect to MongoDB:", err);
//     throw err;
//   }
// }

// const connectedClient = await connectToMongoDB();
// const db = connectedClient.db("Edunexa");

// // "user" and "session" are the default BetterAuth collections.
// const users = db.collection("user");
// const sessions = db.collection("session");
// // NOTE: you had "tutions" (typo). Change back if your data is already there.
// const tuitions = db.collection("tuitions");
// const applications = db.collection("applications");
// const payments = db.collection("payments");

// // ---------- Helpers ----------
// const isValidId = (id) => ObjectId.isValid(id);
// const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// // ---------- Middleware ----------
// // TEMPORARY (no JWT yet): reads the email from a header so role checks work.
// // Anyone can fake this header, so replace it with real JWT verification later.
// // Frontend sends:  headers: { "x-user-email": session.user.email }
// const verifyToken = (req, res, next) => {
//   const email = req.headers["x-user-email"];
//   if (!email) return res.status(401).send({ message: "Unauthorized" });
//   req.decoded = { email };
//   next();
// };

// // Loads the user from DB so role changes apply immediately.
// const requireRole = (role) => async (req, res, next) => {
//   const user = await users.findOne({ email: req.decoded.email });
//   if (!user || user.role !== role) {
//     return res.status(403).send({ message: "Forbidden" });
//   }
//   req.user = user;
//   next();
// };

// const verifyStudent = requireRole("student");
// const verifyTutor = requireRole("tutor");
// const verifyAdmin = requireRole("admin");

// // ---------- Basic ----------
// app.get("/", (req, res) => {
//   res.send("Edunexa server is running");
// });

// // ======================================================
// // 2. USERS
// // ======================================================
// app.get("/api/users/me", verifyToken, async (req, res) => {
//   const user = await users.findOne({ email: req.decoded.email });
//   res.send(user);
// });

// app.patch("/api/users/me", verifyToken, async (req, res) => {
//   const { name, phone, bio, image } = req.body;
//   const update = {};
//   if (name) update.name = name;
//   if (phone !== undefined) update.phone = phone;
//   if (bio !== undefined) update.bio = bio;
//   if (image) update.image = image;
//   await users.updateOne({ email: req.decoded.email }, { $set: update });
//   res.send({ success: true });
// });

// // ROLE CHECK: admin
// app.get("/api/users", verifyToken, verifyAdmin, async (req, res) => {
//   res.send(await users.find({}).sort({ createdAt: -1 }).toArray());
// });

// // ROLE CHECK: admin
// app.patch("/api/users/:id/role", verifyToken, verifyAdmin, async (req, res) => {
//   const { role } = req.body;
//   if (!["student", "tutor", "admin"].includes(role)) {
//     return res.status(400).send({ message: "Invalid role" });
//   }
//   if (!isValidId(req.params.id)) {
//     return res.status(400).send({ message: "Invalid id" });
//   }
//   const result = await users.updateOne(
//     { _id: new ObjectId(req.params.id) },
//     { $set: { role } },
//   );
//   res.send(result);
// });

// // ======================================================
// // 3. TUITIONS
// // ======================================================
// // PUBLIC: approved + active, server-side search/filter/pagination
// app.get("/api/tuitions", async (req, res) => {
//   const { search, classLevel, mode, subject } = req.query;
//   const page = Math.max(parseInt(req.query.page) || 1, 1);
//   const limit = Math.min(parseInt(req.query.limit) || 9, 50);

//   const query = { approvalStatus: "approved", isActive: true };
//   if (search) {
//     const rx = { $regex: escapeRegex(search), $options: "i" };
//     query.$or = [{ title: rx }, { subject: rx }];
//   }
//   if (classLevel) query.classLevel = classLevel;
//   if (mode) query.mode = mode;
//   if (subject) query.subject = subject;

//   const total = await tuitions.countDocuments(query);
//   const list = await tuitions
//     .find(query)
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(limit)
//     .toArray();

//   res.send({
//     tuitions: list,
//     total,
//     page,
//     totalPages: Math.ceil(total / limit),
//   });
// });

// // PUBLIC: 6 latest for home page (must be before /:id)
// app.get("/api/tuitions/latest", async (req, res) => {
//   const list = await tuitions
//     .find({ approvalStatus: "approved", isActive: true })
//     .sort({ createdAt: -1 })
//     .limit(6)
//     .toArray();
//   res.send(list);
// });

// // ROLE CHECK: tutor. Own tuitions only (must be before /:id)
// app.get("/api/tutor/tuitions", verifyToken, verifyTutor, async (req, res) => {
//   const list = await tuitions
//     .find({ tutorEmail: req.user.email })
//     .sort({ createdAt: -1 })
//     .toArray();
//   res.send(list);
// });

// // PUBLIC: details
// app.get("/api/tuitions/:id", async (req, res) => {
//   if (!isValidId(req.params.id)) {
//     return res.status(400).send({ message: "Invalid id" });
//   }
//   const tuition = await tuitions.findOne({ _id: new ObjectId(req.params.id) });
//   if (!tuition) return res.status(404).send({ message: "Not found" });
//   res.send(tuition);
// });

// // ROLE CHECK: tutor. Free plan limit = 2 posts
// app.post("/api/tuitions", verifyToken, verifyTutor, async (req, res) => {
//   const count = await tuitions.countDocuments({ tutorEmail: req.user.email });
//   if (req.user.plan !== "pro" && count >= 2) {
//     return res
//       .status(403)
//       .send({ message: "Free plan limit reached. Upgrade to Pro." });
//   }
//   const {
//     title,
//     subject,
//     classLevel,
//     mode,
//     location,
//     monthlyFee,
//     daysPerWeek,
//     bannerImage,
//     description,
//   } = req.body;

//   const doc = {
//     title,
//     subject,
//     classLevel,
//     mode,
//     location,
//     monthlyFee: Number(monthlyFee),
//     daysPerWeek: Number(daysPerWeek),
//     bannerImage,
//     description,
//     tutorName: req.user.name,
//     tutorEmail: req.user.email, // always from the token, never from the body
//     approvalStatus: "pending",
//     isActive: true,
//     createdAt: new Date(),
//   };
//   const result = await tuitions.insertOne(doc);
//   res.send(result);
// });

// // helper: tutor must own the tuition
// const ownTuition = async (req, res, next) => {
//   if (!isValidId(req.params.id)) {
//     return res.status(400).send({ message: "Invalid id" });
//   }
//   const t = await tuitions.findOne({ _id: new ObjectId(req.params.id) });
//   if (!t) return res.status(404).send({ message: "Not found" });
//   if (t.tutorEmail !== req.user.email) {
//     return res.status(403).send({ message: "Not your tuition" });
//   }
//   req.tuition = t;
//   next();
// };

// // ROLE CHECK: tutor + owner
// app.patch(
//   "/api/tuitions/:id",
//   verifyToken,
//   verifyTutor,
//   ownTuition,
//   async (req, res) => {
//     const allowed = [
//       "title",
//       "subject",
//       "classLevel",
//       "mode",
//       "location",
//       "monthlyFee",
//       "daysPerWeek",
//       "bannerImage",
//       "description",
//     ];
//     const update = {};
//     for (const key of allowed) {
//       if (req.body[key] !== undefined) update[key] = req.body[key];
//     }
//     if (update.monthlyFee) update.monthlyFee = Number(update.monthlyFee);
//     if (update.daysPerWeek) update.daysPerWeek = Number(update.daysPerWeek);
//     res.send(
//       await tuitions.updateOne({ _id: req.tuition._id }, { $set: update }),
//     );
//   },
// );

// // ROLE CHECK: tutor + owner. Toggle Active / Closed
// app.patch(
//   "/api/tuitions/:id/status",
//   verifyToken,
//   verifyTutor,
//   ownTuition,
//   async (req, res) => {
//     const result = await tuitions.updateOne(
//       { _id: req.tuition._id },
//       { $set: { isActive: !!req.body.isActive } },
//     );
//     res.send(result);
//   },
// );

// // ROLE CHECK: tutor + owner
// app.delete(
//   "/api/tuitions/:id",
//   verifyToken,
//   verifyTutor,
//   ownTuition,
//   async (req, res) => {
//     res.send(await tuitions.deleteOne({ _id: req.tuition._id }));
//   },
// );

// // ======================================================
// // 4. APPLICATIONS
// // ======================================================
// // ROLE CHECK: student. Duplicate-safe
// app.post("/api/applications", verifyToken, verifyStudent, async (req, res) => {
//   const { tuitionId, studentPhone, preferredSchedule, studentNote } = req.body;
//   if (!isValidId(tuitionId)) {
//     return res.status(400).send({ message: "Invalid tuition id" });
//   }
//   const tuition = await tuitions.findOne({
//     _id: new ObjectId(tuitionId),
//     approvalStatus: "approved",
//     isActive: true,
//   });
//   if (!tuition)
//     return res.status(404).send({ message: "Tuition not available" });

//   const exists = await applications.findOne({
//     tuitionId,
//     studentEmail: req.user.email,
//   });
//   if (exists) {
//     return res
//       .status(409)
//       .send({ message: "You already applied for this tuition" });
//   }

//   const doc = {
//     tuitionId,
//     tuitionTitle: tuition.title,
//     subject: tuition.subject,
//     monthlyFee: tuition.monthlyFee,
//     tutorEmail: tuition.tutorEmail,
//     tutorName: tuition.tutorName,
//     studentName: req.user.name,
//     studentEmail: req.user.email,
//     studentPhone,
//     preferredSchedule,
//     studentNote,
//     status: "pending",
//     appliedAt: new Date(),
//   };
//   res.send(await applications.insertOne(doc));
// });

// // ROLE CHECK: student. Already applied? (before /:id routes)
// app.get(
//   "/api/applications/check/:tuitionId",
//   verifyToken,
//   verifyStudent,
//   async (req, res) => {
//     const exists = await applications.findOne({
//       tuitionId: req.params.tuitionId,
//       studentEmail: req.user.email,
//     });
//     res.send({ applied: !!exists });
//   },
// );

// // ROLE CHECK: student
// app.get(
//   "/api/applications/my",
//   verifyToken,
//   verifyStudent,
//   async (req, res) => {
//     res.send(
//       await applications
//         .find({ studentEmail: req.user.email })
//         .sort({ appliedAt: -1 })
//         .toArray(),
//     );
//   },
// );

// // ROLE CHECK: tutor
// app.get(
//   "/api/applications/tutor",
//   verifyToken,
//   verifyTutor,
//   async (req, res) => {
//     res.send(
//       await applications
//         .find({ tutorEmail: req.user.email })
//         .sort({ appliedAt: -1 })
//         .toArray(),
//     );
//   },
// );

// // ROLE CHECK: student + owner. Only while pending
// app.delete(
//   "/api/applications/:id",
//   verifyToken,
//   verifyStudent,
//   async (req, res) => {
//     if (!isValidId(req.params.id))
//       return res.status(400).send({ message: "Invalid id" });
//     const result = await applications.deleteOne({
//       _id: new ObjectId(req.params.id),
//       studentEmail: req.user.email,
//       status: "pending",
//     });
//     if (!result.deletedCount) {
//       return res
//         .status(400)
//         .send({ message: "Only your pending applications can be cancelled" });
//     }
//     res.send(result);
//   },
// );

// // ROLE CHECK: tutor + owner
// app.patch(
//   "/api/applications/:id/status",
//   verifyToken,
//   verifyTutor,
//   async (req, res) => {
//     const { status } = req.body;
//     if (!["accepted", "rejected"].includes(status)) {
//       return res.status(400).send({ message: "Invalid status" });
//     }
//     if (!isValidId(req.params.id))
//       return res.status(400).send({ message: "Invalid id" });
//     const result = await applications.updateOne(
//       { _id: new ObjectId(req.params.id), tutorEmail: req.user.email },
//       { $set: { status } },
//     );
//     if (!result.matchedCount)
//       return res.status(403).send({ message: "Not allowed" });
//     res.send(result);
//   },
// );

// // ======================================================
// // 5. DASHBOARD STATS
// // ======================================================
// // ROLE CHECK: student
// app.get("/api/student/stats", verifyToken, verifyStudent, async (req, res) => {
//   const email = req.user.email;
//   const [total, accepted, pending] = await Promise.all([
//     applications.countDocuments({ studentEmail: email }),
//     applications.countDocuments({ studentEmail: email, status: "accepted" }),
//     applications.countDocuments({ studentEmail: email, status: "pending" }),
//   ]);
//   res.send({ total, accepted, pending, plan: req.user.plan || "free" });
// });

// // ROLE CHECK: tutor
// app.get("/api/tutor/stats", verifyToken, verifyTutor, async (req, res) => {
//   const email = req.user.email;
//   const [total, activeApproved, applicants] = await Promise.all([
//     tuitions.countDocuments({ tutorEmail: email }),
//     tuitions.countDocuments({
//       tutorEmail: email,
//       approvalStatus: "approved",
//       isActive: true,
//     }),
//     applications.countDocuments({ tutorEmail: email }),
//   ]);
//   res.send({
//     total,
//     activeApproved,
//     applicants,
//     plan: req.user.plan || "free",
//   });
// });

// // ROLE CHECK: admin
// app.get("/api/admin/stats", verifyToken, verifyAdmin, async (req, res) => {
//   const [totalUsers, totalTutors, pending, approved, revenue] =
//     await Promise.all([
//       users.countDocuments({}),
//       users.countDocuments({ role: "tutor" }),
//       tuitions.countDocuments({ approvalStatus: "pending" }),
//       tuitions.countDocuments({ approvalStatus: "approved" }),
//       payments
//         .aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
//         .toArray(),
//     ]);
//   res.send({
//     totalUsers,
//     totalTutors,
//     pending,
//     approved,
//     revenue: revenue[0]?.total || 0,
//   });
// });

// // ======================================================
// // 6. ADMIN MODERATION + TRANSACTIONS
// // ======================================================
// // ROLE CHECK: admin
// app.get("/api/admin/tuitions", verifyToken, verifyAdmin, async (req, res) => {
//   res.send(await tuitions.find({}).sort({ createdAt: -1 }).toArray());
// });

// // ROLE CHECK: admin
// app.patch(
//   "/api/admin/tuitions/:id/approval",
//   verifyToken,
//   verifyAdmin,
//   async (req, res) => {
//     const { approvalStatus } = req.body;
//     if (!["approved", "rejected"].includes(approvalStatus)) {
//       return res.status(400).send({ message: "Invalid status" });
//     }
//     if (!isValidId(req.params.id))
//       return res.status(400).send({ message: "Invalid id" });
//     res.send(
//       await tuitions.updateOne(
//         { _id: new ObjectId(req.params.id) },
//         { $set: { approvalStatus } },
//       ),
//     );
//   },
// );

// // ROLE CHECK: admin
// app.get("/api/admin/payments", verifyToken, verifyAdmin, async (req, res) => {
//   res.send(await payments.find({}).sort({ paidAt: -1 }).toArray());
// });

// // ======================================================
// // 8. OPTIONAL: SAVED TUITIONS (student)
// // ======================================================
// // ROLE CHECK: student. Stored as savedTuitions: [] in the user doc
// app.get("/api/saved", verifyToken, verifyStudent, async (req, res) => {
//   const ids = (req.user.savedTuitions || [])
//     .filter(isValidId)
//     .map((id) => new ObjectId(id));
//   res.send(await tuitions.find({ _id: { $in: ids } }).toArray());
// });

// app.post(
//   "/api/saved/:tuitionId",
//   verifyToken,
//   verifyStudent,
//   async (req, res) => {
//     await users.updateOne(
//       { email: req.user.email },
//       { $addToSet: { savedTuitions: req.params.tuitionId } },
//     );
//     res.send({ success: true });
//   },
// );

// app.delete(
//   "/api/saved/:tuitionId",
//   verifyToken,
//   verifyStudent,
//   async (req, res) => {
//     await users.updateOne(
//       { email: req.user.email },
//       { $pull: { savedTuitions: req.params.tuitionId } },
//     );
//     res.send({ success: true });
//   },
// );

// ---------- Start ----------
app.listen(port, () => {
  console.log(`Edunexa server listening on port ${port}`);
});

export default app; // needed if you deploy to Vercel

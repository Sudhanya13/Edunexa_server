import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async (req, res) => {
  const cursor = users.find({});
  const result = await cursor.toArray();
  res.send(result);
});

// PUBLIC: approved + active, server-side search/filter/pagination
// app.get("/tuitions", async (req, res) => {
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
// PUBLIC: 6 latest for home page
// app.get("/all-tuitions/latest", async (req, res) => {
//   try {
//     const list = await tuitions
//       .find({
//         approvalStatus: "approved",
//         isActive: true,
//       })
//       .sort({ createdAt: -1 })
//       .limit(6)
//       .toArray();

//     res.status(200).send(list);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ message: "Data fetching failed" });
//   }
// });
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

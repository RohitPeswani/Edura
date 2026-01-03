import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { User } from "../models/user.model.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js";

export const createCourse = async (req,res) => {
    try {
        const {courseTitle, category} = req.body;
        if(!courseTitle || !category) {
            return res.status(400).json({
                message:"Course title and category is required."
            })
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator:req.id
        });

        return res.status(201).json({
            course,
            message:"Course created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}

export const searchCourse = async (req,res) => {
    try {
        const {query = "", categories = "", sortByPrice =""} = req.query;
        
        let categoriesArray = [];
        if (categories) {
            if (Array.isArray(categories)) {
                categoriesArray = categories;
            } else if (typeof categories === "string") {
                categoriesArray = categories.split(",").map(c => c.trim()).filter(Boolean);
            }
        }

        const searchCriteria = {
            isPublished: true
        };

        if (query) {
            searchCriteria.$or = [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
            ];
        }

        if (categoriesArray.length > 0) {
            const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            searchCriteria.category = {
                $in: categoriesArray.map(cat => new RegExp(`^\\s*${escapeRegExp(cat)}\\s*$`, "i"))
            };
        }

        // define sorting order
        const sortOptions = {};
        if(sortByPrice === "low"){
            sortOptions.coursePrice = 1; // sort by price in ascending
        }else if(sortByPrice === "high"){
            sortOptions.coursePrice = -1; // descending
        }

        let courses = await Course.find(searchCriteria).populate({path:"creator", select:"name photoUrl"}).sort(sortOptions);

        return res.status(200).json({
            success:true,
            courses: courses || []
        });

    } catch (error) {
        console.error("Error searching courses:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search courses"
        });
    }
}

export const getPublishedCourse = async (_,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name photoUrl"});
        if(!courses){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get published courses"
        })
    }
}
export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                courses:[],
                message:"Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}
export const editCourse = async (req,res) => {
    try {
        const courseId = req.params.courseId;
        const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        let courseThumbnail;
        if(thumbnail){
            if(course.courseThumbnail){
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId); // delete old image
            }
            // upload a thumbnail on clourdinary
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

 
        const updateData = {courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail:courseThumbnail?.secure_url};

        course = await Course.findByIdAndUpdate(courseId, updateData, {new:true});

        return res.status(200).json({
            course,
            message:"Course updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}
export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params;

        const course = await Course.findById(courseId);

        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        return res.status(200).json({
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get course by id"
        })
    }
}

export const createLecture = async (req,res) => {
    try {
        const {lectureTitle} = req.body;
        const {courseId} = req.params;

        if(!lectureTitle || !courseId){
            return res.status(400).json({
                message:"Lecture title is required"
            })
        };

        // create lecture
        const lecture = await Lecture.create({lectureTitle});

        const course = await Course.findById(courseId);
        if(course){
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(201).json({
            lecture,
            message:"Lecture created successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create lecture"
        })
    }
}
export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lectures"
        })
    }
}
export const editLecture = async (req,res) => {
    try {
        const {lectureTitle, videoInfo, isPreviewFree} = req.body;

        console.log("video info", videoInfo);
        
        const {courseId, lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            })
        }

        // update lecture
        if(lectureTitle) lecture.lectureTitle = lectureTitle;
        if(videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if(videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        lecture.isPreviewFree = isPreviewFree;

        await lecture.save();

        // Ensure the course still has the lecture id if it was not aleardy added;
        const course = await Course.findById(courseId);
        if(course && !course.lectures.includes(lecture._id)){
            course.lectures.push(lecture._id);
            await course.save();
        };
        return res.status(200).json({
            lecture,
            message:"Lecture updated successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to edit lectures"
        })
    }
}
export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        // delete the lecture from couldinary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, // find the course that contains the lecture
            {$pull:{lectures:lectureId}} // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message:"Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to remove lecture"
        })
    }
}
export const getLectureById = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lecture by id"
        })
    }
}


// publich unpublish course logic

export const togglePublishCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {publish} = req.query; // true, false
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message:`Course is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to update status"
        })
    }
}

export const removeCourse = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { courseId } = req.params;
        let course;
        let lecturesList = [];

        // Attempt transaction
        try {
            session.startTransaction();

            course = await Course.findById(courseId).session(session);
            if (!course) {
                await session.abortTransaction();
                return res.status(404).json({
                    message: "Course not found!"
                });
            }

            if (course.lectures && course.lectures.length > 0) {
                lecturesList = await Lecture.find({ _id: { $in: course.lectures } }).session(session);
                await Lecture.deleteMany({ _id: { $in: course.lectures } }).session(session);
            }

            await CoursePurchase.deleteMany({ courseId }).session(session);
            await CourseProgress.deleteMany({ courseId }).session(session);
            await User.updateMany(
                { enrolledCourses: courseId },
                { $pull: { enrolledCourses: courseId } }
            ).session(session);

            await Course.findByIdAndDelete(courseId).session(session);

            await session.commitTransaction();
        } catch (txnError) {
            await session.abortTransaction();
            // If transactions are not supported by the environment (e.g. standalone local MongoDB)
            if (txnError.name === "MongoServerError" && (txnError.code === 20 || txnError.message.includes("transaction"))) {
                console.warn("Transactions not supported by database environment. Falling back to non-transactional cascade delete.");
                
                // Fallback non-transactional execution
                course = await Course.findById(courseId);
                if (!course) {
                    return res.status(404).json({
                        message: "Course not found!"
                    });
                }

                if (course.lectures && course.lectures.length > 0) {
                    lecturesList = await Lecture.find({ _id: { $in: course.lectures } });
                    await Lecture.deleteMany({ _id: { $in: course.lectures } });
                }

                await CoursePurchase.deleteMany({ courseId });
                await CourseProgress.deleteMany({ courseId });
                await User.updateMany(
                    { enrolledCourses: courseId },
                    { $pull: { enrolledCourses: courseId } }
                );

                await Course.findByIdAndDelete(courseId);
            } else {
                throw txnError;
            }
        } finally {
            session.endSession();
        }

        // Post-transaction Cloudinary cleanup (Asynchronous)
        if (course.courseThumbnail) {
            try {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                deleteMediaFromCloudinary(publicId);
            } catch (err) {
                console.error("Failed to delete course thumbnail from Cloudinary:", err);
            }
        }

        if (lecturesList.length > 0) {
            for (const lecture of lecturesList) {
                if (lecture.publicId) {
                    try {
                        deleteVideoFromCloudinary(lecture.publicId);
                    } catch (err) {
                        console.error(`Failed to delete lecture video ${lecture.publicId} from Cloudinary:`, err);
                    }
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: "Course and all associated purchases, progress, and media removed successfully."
        });

    } catch (error) {
        console.error("Error during course removal:", error);
        return res.status(500).json({
            message: "Failed to remove course"
        });
    }
};

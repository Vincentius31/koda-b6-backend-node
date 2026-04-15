import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

const storage = (folder) =>
    multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, folder); 
        },
        filename: function (req, file, cb) {
            const randStr = nanoid();
            const ext = path.extname(file.originalname);
            const newFileName = `${randStr}${ext}`;
            cb(null, newFileName);
        },
    });

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, and JPEG are allowed"), false);
    }
};

/**
 * Upload middleware with default 10MB limit
 * @param {string} folder 
 * @returns {multer.Multer}
 */
function uploadMiddleware(folder) {
    return multer({
        storage: storage(folder),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: fileFilter,
    });
}

/**
 * Upload middleware for profile pictures (1MB limit)
 * @param {string} folder 
 * @returns {multer.Multer}
 */
function uploadProfileMiddleware(folder) {
    return multer({
        storage: storage(folder),
        limits: {
            fileSize: 1 * 1024 * 1024,
        },
        fileFilter: fileFilter,
    });
}

export default uploadMiddleware;
export { uploadProfileMiddleware };
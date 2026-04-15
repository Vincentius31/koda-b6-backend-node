import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";

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

function uploadMiddleware(folder) {
    return multer({
        storage: storage(folder),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    });
}

export default uploadMiddleware;
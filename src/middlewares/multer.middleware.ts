import multer from 'multer';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, 'uploads');
    },
    filename(req, file, callback) {
        const id = uuid();
        const extName = file.originalname.trim().split('.').pop();
        const fileName = `${id}.${extName}`;
        callback(null, fileName);
    },
});

const fieldname: string = 'photo';
export const singleUpload = multer({ storage }).single(fieldname);

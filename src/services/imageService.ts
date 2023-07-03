import { uploadBytes, deleteObject, ref, getDownloadURL } from 'firebase/storage';
import storage from '../firebase.js';

const metadata = {
  contentType: 'image/png',
};

class ImageService {
  async getRef(path: string) {
    return ref(storage, `images/${path}`);
  }

  async getImage(uuid: string) {
    const ref = await this.getRef(uuid);
    return getDownloadURL(ref);
  }
  async uploadFile(path: string, data: Buffer) {
    const ref = await this.getRef(path);
    await uploadBytes(ref, data, metadata).catch(err => {
      console.log(err);
    });
  }

  async deleteFile(path: string) {
    const ref = await this.getRef(path);
    await deleteObject(ref).catch(err => {
      console.log(err);
    });
  }
}

export default new ImageService();

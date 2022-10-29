import ImageKit from "imagekit";
import 'dotenv/config'

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || " ",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || " ",
  urlEndpoint: "https://ik.imagekit.io/couponluxury",
});

export const removeImgFromImageKit = (imageName: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      //find the image in imageKit
      const images = await imageKit.listFiles({ name: imageName });
      console.log(images);
      //if there is an image, delete it
      if (images.length > 0) {
        const deletedImg = await imageKit.deleteFile(images[0].fileId);
        console.log("deletedImg", deletedImg);
      }
      resolve({ message: "image deleted" });
    } catch (err) {
      console.log(err);
      reject();
    }
  });
};

export default imageKit;

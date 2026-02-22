import crypto from "crypto";

const generateHash = (data) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
};

export const hash = generateHash;
export default generateHash;

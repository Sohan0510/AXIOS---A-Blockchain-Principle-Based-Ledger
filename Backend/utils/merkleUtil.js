import crypto from "crypto";

/* ================= SHA256 ================= */
const hash = (data) =>
  crypto.createHash("sha256").update(data).digest("hex");

/* ================= CANONICAL JSON ================= */
const canonicalize = (value) => JSON.stringify(sortKeys(value));

const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeys(value[key]);
        return acc;
      }, {});
  }

  return value;
};

/* ================= MERKLE TREE ================= */
export const buildMerkleTree = (fieldsObject) => {
  if (!fieldsObject || typeof fieldsObject !== "object") {
    throw new Error("Invalid input to Merkle Tree");
  }

  const sortedKeys = Object.keys(fieldsObject).sort();

  const leafHashMap = {};
  let leafHashes = [];

  sortedKeys.forEach((key) => {
    const canonicalValue = canonicalize(fieldsObject[key]);
    const leafHash = hash(canonicalValue);
    leafHashMap[key] = leafHash;
    leafHashes.push(leafHash);
  });

  if (leafHashes.length === 0) {
    return {
      merkleRoot: null,
      leafHashMap: {},
      levels: [],
    };
  }

  const levels = [];
  levels.push(leafHashes);

  let currentLevel = leafHashes;

  while (currentLevel.length > 1) {
    const nextLevel = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right =
        i + 1 < currentLevel.length
          ? currentLevel[i + 1]
          : currentLevel[i];

      nextLevel.push(hash(`${left}:${right}`));
    }

    levels.push(nextLevel);
    currentLevel = nextLevel;
  }

  return {
    merkleRoot: currentLevel[0],
    leafHashMap,
    levels,
  };
};
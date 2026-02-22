import axios from "axios";

export const getWitnessServers = () => {
  const raw = process.env.WITNESS_SERVERS || process.env.WITNESS_SERVER || "";
  if (!raw) return [];
  return raw.split(",").map(s => s.trim()).filter(Boolean);
};

export const collectWitnessSignatures = async (merkleRoot) => {
  const servers = getWitnessServers();

  if (!servers.length) {
    throw new Error("No witness servers configured");
  }

  const settled = await Promise.allSettled(
    servers.map((url) =>
      axios.post(`${url}/sign`, { merkleRoot }, { timeout: 5000 })
    )
  );

  const results = settled.map((s, idx) => {
    if (s.status === "fulfilled") {
      return {
        ok: true,
        url: servers[idx],
        data: s.value.data,
      };
    }
    return {
      ok: false,
      url: servers[idx],
      error: s.reason?.message || String(s.reason),
    };
  });

  const successes = results.filter((r) => r.ok);
  const failures = results.filter((r) => !r.ok);

  // 🔥 Majority Calculation
  const total = servers.length;
  const requiredMajority = Math.floor(total / 2) + 1;

  console.log(`Witness responses: ${successes.length}/${total}`);
  console.log(`Majority required: ${requiredMajority}`);

  if (successes.length < requiredMajority) {
    console.error("Majority not achieved. Rejecting.");
    throw new Error(
      `Witness majority not achieved. Required: ${requiredMajority}, Got: ${successes.length}`
    );
  }

  console.log("Majority achieved. Proceeding.");

  // Return only successful signature payloads
  return successes.map((s) => s.data);
};
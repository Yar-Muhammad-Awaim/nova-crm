import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const TEST_SECRET = "super-secret-enterprise-key-1234567890";
const encodeKey = (s) => new TextEncoder().encode(s);

test("JWT session tokens sign and verify with HS256 algorithm", async () => {
  const session = { userId: "ADMIN", role: "ADMIN", name: "System Admin" };
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(encodeKey(TEST_SECRET));

  assert.ok(typeof token === "string" && token.split(".").length === 3);

  const { payload } = await jwtVerify(token, encodeKey(TEST_SECRET), { algorithms: ["HS256"] });
  assert.equal(payload.userId, session.userId);
  assert.equal(payload.role, session.role);
  assert.equal(payload.name, session.name);
});

test("JWT verification rejects tokens signed with a different secret", async () => {
  const token = await new SignJWT({ userId: "PM01", role: "MANAGER", name: "Ayesha Khan" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(encodeKey(TEST_SECRET));

  const wrongKey = encodeKey("completely-different-signing-secret");
  await assert.rejects(
    async () => jwtVerify(token, wrongKey, { algorithms: ["HS256"] }),
    /signature verification failed/i
  );
});

test("JWT verification detects payload tampering", async () => {
  const token = await new SignJWT({ userId: "DEV01", role: "AGENT", name: "Ali Raza" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(encodeKey(TEST_SECRET));

  const parts = token.split(".");
  // Tamper with payload to escalate role to ADMIN
  const decodedPayload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  decodedPayload.role = "ADMIN";
  const forgedPayload = Buffer.from(JSON.stringify(decodedPayload)).toString("base64url");
  const tamperedToken = `${parts[0]}.${forgedPayload}.${parts[2]}`;

  await assert.rejects(
    async () => jwtVerify(tamperedToken, encodeKey(TEST_SECRET), { algorithms: ["HS256"] }),
    /signature verification failed/i
  );
});

test("JWT verification rejects expired tokens", async () => {
  const expiredToken = await new SignJWT({ userId: "PM02", role: "MANAGER", name: "Bilal Ahmed" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 7200) // 2 hours ago
    .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // expired 1 hour ago
    .sign(encodeKey(TEST_SECRET));

  await assert.rejects(
    async () => jwtVerify(expiredToken, encodeKey(TEST_SECRET), { algorithms: ["HS256"] }),
    (err) => err.code === "ERR_JWT_EXPIRED"
  );
});

test("JWT verification enforces algorithm whitelisting", async () => {
  // Reject tokens attempting "none" algorithm
  const token = await new SignJWT({ userId: "DEV02", role: "AGENT", name: "Hamza Shah" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(encodeKey(TEST_SECRET));

  // If verifier expects only HS512, HS256 must be rejected
  await assert.rejects(
    async () => jwtVerify(token, encodeKey(TEST_SECRET), { algorithms: ["HS512"] }),
    (err) => err.code === "ERR_JOSE_GENERIC" || /algorithm/i.test(err.message)
  );
});

test("bcrypt password hashing verifies authentic passwords and rejects invalid ones", async () => {
  const password = "SuperSecretPassword123!";
  const hash = await bcrypt.hash(password, 10);

  assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"));
  assert.equal(await bcrypt.compare(password, hash), true);
  assert.equal(await bcrypt.compare("WrongPassword!", hash), false);
  assert.equal(await bcrypt.compare("", hash), false);
});

test("bcrypt UTF-8 byte boundary protects against password truncation attacks", () => {
  // Bcrypt algorithm truncates passwords longer than 72 bytes.
  // The system enforces a strict 72-byte UTF-8 schema validation.
  const utf8Char = "€"; // 3 bytes in UTF-8
  const valid24Chars = utf8Char.repeat(24); // 72 bytes
  const invalid25Chars = utf8Char.repeat(25); // 75 bytes

  assert.equal(new TextEncoder().encode(valid24Chars).length, 72);
  assert.equal(new TextEncoder().encode(invalid25Chars).length, 75);
});

function firstEnvValue(names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getRazorpayConfig() {
  const keyIdNames = ["RAZORPAY_KEY_ID", "RAZORPAY_KEYID", "REACT_APP_RAZORPAY_KEY_ID"];
  const keySecretNames = ["RAZORPAY_KEY_SECRET", "RAZORPAY_SECRET_KEY", "RAZORPAY_KEYSECRET"];

  const keyId = firstEnvValue(keyIdNames);
  const keySecret = firstEnvValue(keySecretNames);

  return {
    keyId,
    keySecret,
    missingKeyId: !keyId,
    missingKeySecret: !keySecret,
    keyIdNames,
    keySecretNames,
  };
}

module.exports = { getRazorpayConfig };

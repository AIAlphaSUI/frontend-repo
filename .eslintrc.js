module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    // Disable rules causing problems
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    "react-hooks/exhaustive-deps": "warn",
  },
};

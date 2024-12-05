import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import dotenv from "dotenv";
dotenv.config();

export default {
  input: "src/script.js",
  output: {
    file: "dist/bundle.js",
    format: "es",
  },
  plugins: [
    replace({
      //inject env values
      "REPLACE_ME_WITH_ENV_VALUES": JSON.stringify(process.env),
    }),
    resolve({
      //resolve paths
      browser: true,
    }),
    commonjs(), //resolve internal cjs deps
  ],
};

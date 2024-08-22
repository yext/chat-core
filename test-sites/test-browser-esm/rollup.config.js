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
      "process.env.TEST_BOT_API_KEY": JSON.stringify(
        process.env.TEST_BOT_API_KEY
      ),
      "process.env.TEST_BOT_ID": JSON.stringify(process.env.TEST_BOT_ID),
    }),
    resolve({
      //resolve paths
      browser: true,
    }),
    commonjs(), //resolve internal cjs deps
  ],
};

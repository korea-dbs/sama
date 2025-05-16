"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv = require("dotenv");
const envalid_1 = require("envalid");
dotenv.config();
exports.env = (0, envalid_1.cleanEnv)(process.env, {
    API_PORT: (0, envalid_1.port)({ default: 3000 }),
});
//# sourceMappingURL=env.js.map
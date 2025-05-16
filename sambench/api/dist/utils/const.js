"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspacePath = exports.sourcesPath = exports.HostPath = exports.AndroidPath = void 0;
const path = require("path");
const process_1 = require("process");
exports.AndroidPath = {
    Query: '/sdcard/queries',
    ExternalDB: '/data/user/0/com.android.providers.media.module/databases/external.db',
};
exports.HostPath = {
    Source: path.resolve(process.cwd(), 'sources'),
    Query: path.resolve(process.cwd(), 'sources', 'queries'),
    Workspace: process_1.env.WORK_DIR
};
exports.sourcesPath = path.resolve(process.cwd(), 'sources');
exports.workspacePath = process_1.env.WORK_DIR;
//# sourceMappingURL=const.js.map
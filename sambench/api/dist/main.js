"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger/logger");
const custom_exception_filter_1 = require("./utils/custom-exception-filter");
const env_1 = require("./utils/env");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const fs = require("fs");
const path = require("path");
function getPackageDetails() {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
    const { name, description, version } = packageJson;
    return { name, description, version };
}
function buildSwagger(app, options) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('SAMA Dashboard')
        .setDescription(options.description)
        .setVersion(options.version)
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    return document;
}
async function appFactory(module, options) {
    const app = await core_1.NestFactory.create(module, {
        ...options,
    });
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new custom_exception_filter_1.CustomExceptionFilter());
    return app;
}
async function bootstrap() {
    const app = await appFactory(app_module_1.AppModule, {
        bufferLogs: true,
        logger: new logger_1.MyLogger(),
    });
    const packageDetails = getPackageDetails();
    const document = buildSwagger(app, {
        title: packageDetails.name,
        description: packageDetails.description,
        version: packageDetails.version,
    });
    swagger_1.SwaggerModule.setup(`/api`, app, document);
    app.startAllMicroservices();
    await app.listen(env_1.env.API_PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map
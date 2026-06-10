const nodemailer = require('nodemailer');

const testSMTP = async () => {
    const emailUser = 'connect@skrmblissai.in';
    const emailPass = process.argv[2]; 

    if (!emailPass) {
        console.error("❌ You forgot to put the new password inside the quotes!");
        process.exit(1);
    }

    const configs = [
        { host: 'smtpout.secureserver.net', port: 465, secure: true },
        { host: 'smtp.titan.email', port: 465, secure: true }
    ];

    for (const config of configs) {
        console.log(`\nTesting: ${config.host} (Port ${config.port})`);
        const transporter = nodemailer.createTransport({
            ...config,
            auth: { user: emailUser, pass: emailPass }
        });

        try {
            await transporter.verify();
            console.log(`✅ SUCCESS on ${config.host}:${config.port}`);
            return;
        } catch (error) {
            console.error(`❌ FAILED: ${error.code || error.message}`);
        }
    }
};

testSMTP();

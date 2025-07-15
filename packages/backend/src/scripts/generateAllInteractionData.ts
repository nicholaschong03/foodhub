import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runScript(scriptName: string, description: string) {
    console.log(`\n🚀 Starting ${description}...`);
    console.log(`📁 Running script: ${scriptName}`);

    try {
        const { stdout, stderr } = await execAsync(`npx ts-node src/scripts/${scriptName}.ts`, {
            cwd: process.cwd()
        });

        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.error(stderr);
        }

        console.log(`✅ ${description} completed successfully!`);
        return true;
    } catch (error) {
        console.error(`❌ Error running ${scriptName}:`, error);
        return false;
    }
}

async function main() {
    console.log('🎯 Starting comprehensive interaction data generation...');
    console.log('📊 This will generate likes, saves, and follows data for your recommendation system');

    const scripts = [
        { name: 'generateFollows', description: 'Follow relationships generation' },
        { name: 'generatePostLikes', description: 'Post likes generation' },
        { name: 'generatePostSaves', description: 'Post saves generation' }
    ];

    let successCount = 0;
    let totalScripts = scripts.length;

    for (const script of scripts) {
        const success = await runScript(script.name, script.description);
        if (success) {
            successCount++;
        }

        // Add a small delay between scripts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 Data generation process completed!');
    console.log(`📈 Successfully ran ${successCount}/${totalScripts} scripts`);

    if (successCount === totalScripts) {
        console.log('✅ All scripts completed successfully!');
        console.log('🎯 Your recommendation system now has sufficient interaction data for collaborative filtering.');
    } else {
        console.log('⚠️  Some scripts failed. Please check the errors above and run failed scripts individually.');
    }
}

// Run the master script
main().catch(err => {
    console.error('❌ Master script failed:', err);
    process.exit(1);
});
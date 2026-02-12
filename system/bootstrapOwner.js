import fs from 'fs-extra';

const DATA_PATH = './data/system.json';

export async function bootstrapOwner() {
  await fs.ensureFile(DATA_PATH);

  let data = {};
  try {
    data = await fs.readJson(DATA_PATH);
  } catch {
    data = {};
  }

  if (!data.owner) {
    data.owner = {
      id: "26775949123@s.whatsapp.net",
      createdAt: Date.now()
    };

    await fs.writeJson(DATA_PATH, data, { spaces: 2 });
    console.log("🐉 Owner initialized.");
  } else {
    console.log("🐉 Owner already exists.");
  }
}

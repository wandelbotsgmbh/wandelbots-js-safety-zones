const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")
const path = require("path")

const baseUrl =
  "https://cdn.jsdelivr.net/gh/wandelbotsgmbh/wandelbots-js-react-components/public/models/"
const publicFolder = path.join(__dirname, "../public/models")

// Ensure the public folder exists
if (!fs.existsSync(publicFolder)) {
  fs.mkdirSync(publicFolder, { recursive: true })
}

async function fetchModelList() {
  try {
    const response = await axios.get(baseUrl)
    const $ = cheerio.load(response.data)
    const modelFiles = []

    $("a").each((index, element) => {
      const href = $(element).attr("href")
      if (href.endsWith(".glb")) {
        modelFiles.push(`https://cdn.jsdelivr.net${href}`)
      }
    })

    return modelFiles
  } catch (error) {
    console.error("Failed to fetch model list:", error)
    return []
  }
}

async function downloadModel(fileUrl) {
  const fileName = path.basename(fileUrl)
  const filePath = path.join(publicFolder, fileName)

  try {
    const response = await axios({
      url: fileUrl,
      method: "GET",
      responseType: "stream",
    })

    const writer = fs.createWriteStream(filePath)
    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve)
      writer.on("error", reject)
    })
  } catch (error) {
    console.error(`Failed to download ${fileUrl}:`, error)
  }
}

async function downloadAllModels() {
  const modelFiles = await fetchModelList()
  for (const fileUrl of modelFiles) {
    console.log(`Downloading ${fileUrl}...`)
    await downloadModel(fileUrl)
  }
  console.log("All models downloaded successfully.")
}

downloadAllModels()

let parseButton = document.getElementById('clickParse')

parseButton.onclick = function(element) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.executeScript(tabs[0].id, {
      // code: 'document.body.style.backgroundColor = "' + color + '";'
      file: 'parse.js'
    })
  })
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(
    sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension'
  )
  let csvInfo = generateCSV(request.pageInfo)
  downloadCSV(csvInfo)
})

function generateCSV(pageInfo) {
  const rows = []
  const { filterInfo, colInfo } = pageInfo
  let childrenLength = colInfo[0].children.length
  rows.push(filterInfo.join('-'))
  for (let singleCol of colInfo) {
    let { children, title } = singleCol
    rows.push(title)
    rows.push('Index,Name,Link,Change,Description')

    for (let child of children) {
      const {
        index,
        name,
        url,
        changeText = 'None',
        changeDesc = 'None'
      } = child
      rows.push([index, name, url, changeText, changeDesc].join(','))
    }
    rows.push(' ')
  }

  const csvContent = rows.join('\n')
  let date = new Date().toLocaleDateString()
  const csvName = `${date}_${filterInfo.join('_')}_${childrenLength}`
  return {
    name: csvName,
    content: csvContent
  }
}

function downloadCSV(csvInfo) {
  const { name, content } = csvInfo
  let blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  let url = window.URL.createObjectURL(blob)
  let link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', name)
  document.body.appendChild(link) // Required for FF

  link.click() // This will download the data file named "my_data.csv".
}

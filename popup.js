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
  const { filterInfo, flag } = pageInfo
  if (flag === 'all') {
    const colInfo = pageInfo
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
  if (flag === 'brand') {
    rows.push(filterInfo.join('-'))
    const Index = '序号',
      Name = 'App名',
      Link = '链接',
      Company = '公司名',
      KeyWordCover = '关键词覆盖',
      CommentRating = '评分统计',
      TotalRank = '总排名',
      TotalRankChangeDirection = '总排名变化方向',
      TotalRankChangeNum = '总排名变化数',
      TotalRankChangeDesc = '总排名变化描述',
      Cate = '分类',
      CateRank = '分类排名',
      CateRankChangeDirection = '分类排名变化方向',
      CateRankChangeNum = '分类排名变化数',
      CateRankChangeDesc = '分类排名变化描述'

    //cate,cateRank,cateRankChangeDirection,cateRankChangeNum,cateRankChangeDesc
    rows.push(
      [
        Index,
        Name,
        Link,
        Company,
        KeyWordCover,
        CommentRating,
        TotalRank,
        TotalRankChangeDirection,
        TotalRankChangeNum,
        TotalRankChangeDesc,
        Cate,
        CateRank,
        CateRankChangeDirection,
        CateRankChangeNum,
        CateRankChangeDesc
      ].join(',')
    )

    const { infoList } = pageInfo
    let childrenLength = infoList.length
    for (let info of infoList) {
      let {
        index = '',
        name = '',
        url = '',
        company = '',
        totalRankInfo,
        catRankInfo,
        keyWordCoverage = '',
        commentRating = ''
      } = info

      rows.push(
        [
          index,
          name.replace(/,/g, '_'),
          url,
          company.replace(/,/g, '_'),
          keyWordCoverage,
          commentRating,
          totalRankInfo.rankNum,
          totalRankInfo.rankChangeDirection,
          totalRankInfo.rankChangeNum,
          totalRankInfo.rankChangeDesc &&
            totalRankInfo.rankChangeDesc.replace(/,/g, '_'),
          catRankInfo.rankCate,
          catRankInfo.rankNum,
          catRankInfo.rankChangeDirection,
          catRankInfo.rankChangeNum,
          catRankInfo.rankChangeDesc &&
            catRankInfo.rankChangeDesc.replace(/,/g, '_')
        ].join(',')
      )
    }

    const csvContent = rows.join('\r\n')
    let date = new Date().toLocaleDateString()
    const csvName = `${date}_${filterInfo.join('_')}_${childrenLength}`

    return {
      name: csvName,
      content: csvContent
    }
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

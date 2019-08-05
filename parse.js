function AllParser() {
  let pageInfo = { colInfo: [], flag: 'all' }

  let filters = document
      .getElementsByClassName('filter-container')[0]
      .getElementsByClassName('active'),
    filterInfo = []
  for (let filter of filters) {
    filterInfo.push(filter.innerText)
  }
  pageInfo.filterInfo = filterInfo

  let colAry = document.getElementsByClassName('top-item')
  let colInfo = []

  for (let col of colAry) {
    let info = { children: [] }
    let title = col.getElementsByClassName('title-item')[0].innerText
    info.title = title

    let children = col.parentElement.getElementsByClassName('child-item')
    for (let child of children) {
      // let index = child.getElementsByClassName('index-1')[0].innerText
      let index = child
        .getElementsByClassName('left-item')[0]
        .getElementsByTagName('span')[0].innerText
      let name = child
        .getElementsByClassName('medium-txt')[0]
        .getElementsByTagName('a')[0].innerText
      let url = child
        .getElementsByClassName('medium-txt')[0]
        .getElementsByTagName('a')[0].href
      let changeDesc =
        (child.getElementsByClassName('up-item')[0] &&
          child.getElementsByClassName('up-item')[0].getAttribute('title')) ||
        (child.getElementsByClassName('down-item')[0] &&
          child.getElementsByClassName('down-item')[0].getAttribute('title'))

      let changeDirection =
        (child.getElementsByClassName('up-item')[0] && '上升') ||
        (child.getElementsByClassName('down-item')[0] && '下降') ||
        ''

      let changeText =
        (child.getElementsByClassName('change-text')[0] &&
          child.getElementsByClassName('change-text')[0].innerText) ||
        ''
      info.children.push({
        index,
        name,
        url,
        changeDesc,
        changeText: changeDirection + changeText
      })
    }
    colInfo.push(info)
  }
  pageInfo.colInfo = colInfo
  return pageInfo
}

function BrandParser() {
  function rankParse(rankItem) {
    let rankNum =
        rankItem.getElementsByClassName('num')[0] &&
        rankItem.getElementsByClassName('num')[0].innerText,
      rankCate =
        rankItem.getElementsByClassName('category')[0] &&
        rankItem.getElementsByClassName('category')[0].innerText,
      rankChangeDirection =
        (rankItem.getElementsByClassName('rank-up')[0] && '上升') ||
        (rankItem.getElementsByClassName('rank-down')[0] && '下降') ||
        (rankItem.getElementsByClassName('no-change')[0] && '没有变化') ||
        '',
      rankChangeDesc =
        (rankItem.getElementsByClassName('rank')[0] &&
          (rankItem.getElementsByClassName('rank')[0].title ||
            rankItem.getElementsByClassName('rank')[0].innerText)) ||
        (rankItem.getElementsByClassName('no-change')[0] && '没有变化') ||
        '',
      rankChangeNum =
        rankItem.getElementsByClassName('rank')[0] &&
        rankItem
          .getElementsByClassName('rank')[0]
          .getElementsByTagName('span')[0] &&
        rankItem
          .getElementsByClassName('rank')[0]
          .getElementsByTagName('span')[0].innerText

    return {
      rankNum,
      rankCate,
      rankChangeDirection,
      rankChangeDesc,
      rankChangeNum
    }
  }

  let pageInfo = { infoList: [], flag: 'brand' }

  let filters = document
      .getElementsByClassName('filter-container')[0]
      .getElementsByClassName('active'),
    filterInfo = []
  for (let filter of filters) {
    filterInfo.push(filter.innerText.trim())
  }
  pageInfo.filterInfo = filterInfo

  let table = document.getElementsByTagName('tbody')[0],
    itemList = table.getElementsByTagName('tr'),
    infoList = []

  for (let item of itemList) {
    // let index = child.getElementsByClassName('index-1')[0].innerText
    if (item.getElementsByClassName('index')[0] === undefined) {
      continue
    }
    let index = item.getElementsByClassName('index')[0].innerText,
      name = item.getElementsByClassName('name')[0].innerText,
      url = item.getElementsByClassName('name')[0].href,
      company = item.getElementsByClassName('company')[0].innerText,
      [totalRank, cateRank] = [
        item.getElementsByTagName('td')[2],
        item.getElementsByTagName('td')[3]
      ],
      totalRankInfo = rankParse(totalRank),
      catRankInfo = rankParse(cateRank),
      keyWordCoverage = item.getElementsByClassName('keyword-cover')[0]
        .innerText,
      commentRating = item
        .getElementsByClassName('comment-rating')[0]
        .getElementsByTagName('a')[0].innterText

    infoList.push({
      index,
      name,
      url,
      company,
      totalRankInfo,
      catRankInfo,
      keyWordCoverage,
      commentRating
    })
  }
  // console.info('>>>>infoList', infoList)
  pageInfo.infoList = infoList
  return pageInfo
}

function send(pageInfo) {
  chrome.runtime.sendMessage({ pageInfo }, function(response) {
    // console.log(response.farewell)
    console.info('get response', response)
  })
}

function dispatcher() {
  let currentUrl = document.URL
  if (currentUrl.match('/rank/index/brand/all') !== null) {
    return AllParser
  }
  if (currentUrl.match('/rank/index/brand') !== null) {
    return BrandParser
  }
  return () => {}
}

function main() {
  let parser = dispatcher()
  let pageInfo = parser()
  // console.info('pageInfo', pageInfo)
  send(pageInfo)
}

main()

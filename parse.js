function parse() {
  let pageInfo = { colInfo: [] }

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

function send(pageInfo) {
  chrome.runtime.sendMessage({ pageInfo }, function(response) {
    // console.log(response.farewell)
    console.info('get response', response)
  })
}

function main() {
  let pageInfo = parse()
  console.info('pageInfo', pageInfo)
  send(pageInfo)
}

main()

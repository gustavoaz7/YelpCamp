const cgSearch = document.querySelector('#campground-search')

cgSearch.addEventListener('input', (e) => {
  const query = e.target.value

  const ajax = new XMLHttpRequest()
  ajax.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const data = JSON.parse(this.response)

      const cgGrid = document.querySelector('#campground-grid')
      cgGrid.innerHTML = ''
      data.forEach(campground => {
        cgGrid.innerHTML += `
          <div class="col-md-3 col-sm-6">
            <div class="thumbnail">
              <img src="${campground.image}">
              <div class="caption">
                <h4>${campground.name}</h4>
              </div>
              <p><a href="/campgrounds/<${campground._id}" class="btn btn-primary">More info</a></p>
            </div>
          </div>
        `
      })
    } 
  }
  ajax.open('GET', `/campgrounds?search=${query}`, true)
  ajax.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
  ajax.send()
})

document.querySelector('#campground-search').addEventListener('submit', (e) => {
  e.preventDefault()
})
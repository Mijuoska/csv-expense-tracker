
function createCSVArray(input, separator) {
	const regexMap = {
		'comma': /,/g,
		'semicolon': /;/g,
		'pipe': /|/
	}
	const regex = regexMap[separator]
	const csvArr = input.split('\n')
	for (let i = 0; i < csvArr.length; i++) {
		csvArr[i] = csvArr[i].replace(/\n/ig, '')
		// replacing � with ä
		csvArr[i] = csvArr[i].replace(/�/g, 'ä')
		// in case of separator being something else than a comma, we have to deal with commas within columns
		if (separator != 'comma') {
			csvArr[i] = csvArr[i].replace(regexMap['comma'], '.')
		}
		csvArr[i] = csvArr[i].replace(regex, ',')
		csvArr[i] = csvArr[i].trim()
		csvArr[i] = csvArr[i].split(',')

	}
	return csvArr

}


function createJSOBject(csvArr) {
	const header = csvArr.splice(0, 1)[0]
	// Checking if the correct delimiter has been used
	if (header.length == 1) {
		alert('Please choose a proper delimiter for this file')
		console.log('Not a proper delimiter')
		document.getElementById('csv-file').value = ''
		return
	}

	const objArr = []
	for (let i = 0; i < csvArr.length; i++) {
		let obj = {}
		header.forEach(function (item) {
			obj[item] = csvArr[i][header.indexOf(item)]
		})
		objArr.push(obj)
	}
	if (objArr.length == 1) {
		return objArr[0]
	} else {
		return objArr
	}
}


function convertCSV(input) {
	const delimiter = document.getElementById('delimiter').value
	const csvArr = createCSVArray(input, delimiter)
	const data = createJSOBject(csvArr)
	if (data) {   
		return data
	} else {
		return 
	}
}





    




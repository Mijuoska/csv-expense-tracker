function main(data, datekey, sumkey, dateformat) {
const output = {}
let converted = convertToNumbers(data, sumkey)
if (typeof converted[0][datekey] != 'object') {
	converted = convertDates(converted, datekey, dateformat)
}
const sorted = sortByDate(converted, datekey)
populateDates(sorted, datekey)
output.expenses = getExpenses(sorted, sumkey)
output.income = getIncome(sorted, sumkey)
output.difference = getDifference(output.expenses, output.income)
return output
}


function readFile(file) {
	const reader = new FileReader()
	reader.readAsText(file)
	const extension = file.name.split('.')[1]
	if (extension != 'csv') {
		alert('Please upload only csv files')
		document.getElementById('csv-file').value = ''
		return
	}
	else {
		return reader
	}
}

function getData() {
	const data = localStorage.getItem('data')
	try {
		return data ? JSON.parse(data) : []
	} catch (e) {
		return []
	}
}


function getInputFieldIDKeys() {
	const keyObj = {} 
	keyObj.sumkey = document.getElementById('headers-map-sum').value
	keyObj.datekey = document.getElementById('headers-map-date').value
	keyObj.recipientkey = document.getElementById('headers-map-recipient').value
	keyObj.dateformat = document.getElementById('dateformat').value
	return keyObj
}



function headerMapper(data, element) {
	let headers
	if (data) {
		headers = Object.keys(data[0])
	} else {
		return
	}
	const select = document.getElementById(element)
	const container = document.getElementById('field-maps')
	const options = []

	// create regex arrays for automapping
	let regexArr
	if (element == 'headers-map-sum') {
		regexArr = [/\bSum/, /\bAmount/, /\bMäär/]
	} else if (element == 'headers-map-date') {
		regexArr = [/\b(D|d)ate\b/, /päivä\b/]
	} else if (element == 'headers-map-recipient') {
		regexArr = [/\bRec/, /\bSaa/]
	}

	// remove previous options from a previous file upload
	if (select.options.length > 0) {
		for (var i = 0; i < options.length; i++) {
			options.pop()
		}
		select.innerHTML = ''
	}
	let match
	let matchArr = []
	// create options for each header
	headers.forEach(function (header) {
		options.push(document.createElement('option'))
		options[headers.indexOf(header)].value = header
		options[headers.indexOf(header)].innerText = header

		
		// match regex for auto-map below
		regexArr.forEach(function (regex) {
			if (header.match(regex)) {
				match = header.match(regex)
				matchArr.push(match)
			}
		})

	})
	options.forEach(function (option) {
		select.appendChild(option)
	})

	// auto-map options value
	if (matchArr[0]) {
		select.value = matchArr[0].input
	}
	container.classList.toggle = 'hide'
}




function populateDates(sortedArr, datekey) {
	const dates = document.getElementById('dates')
	if (dates.classList.value == 'hide') {
		dates.classList.toggle('hide')
	}
	document.getElementById('start-date').innerText = sortedArr[0][datekey].toDateString()
	document.getElementById('end-date').innerText = sortedArr[sortedArr.length - 2][datekey].toDateString()
}



function convertToNumbers(bankStatement, sumkey) {
	bankStatement.forEach(function (entry) {
		entry[sumkey] = parseFloat(entry[sumkey])
	})
	return bankStatement
}


function convertDates(bankStatement, datekey, format) {
	// if format is mm.dd.yyyy, dd/mm/yyyy, dd.mm.yyyy, we have to convert
	for (let i = 0; i < bankStatement.length; i++) {
		let temp
		let outputDate
		switch(format) {
		case 'dd.mm.yyyy':
			temp = bankStatement[i][datekey].split('.')
			temp.unshift(temp[1])
			temp.splice(2, 1)
			outputDate = temp.join('/')
			break
		case 'mm.dd.yyyy':
			temp = bankStatement[i][datekey].split('.')
			outputDate = temp.join('/')
			break
		case 'dd/mm/yyyy':
			temp = bankStatement[i][datekey].split('/')
			temp.unshift(temp[1])
			temp.splice(2, 1)
			outputDate = temp.join('/')
			break
		default:
			outputDate = bankStatement[i][datekey]
		}
		bankStatement[i][datekey] = new Date(outputDate)
	}
	return bankStatement

} 

function sortByDate(bankStatement, datekey) {
	bankStatement.sort(function (a, b) {
		if (a[datekey] < b[datekey]) {
			return -1
		} else if (b[datekey] > a[datekey]) {
			return 1
		} else {
			return 0
		}
	})
	return bankStatement
}


function getExpenses(bankStatement, sumkey) {
	const output = {}
	output.total = 0
	output.entries = []
	for (let i = 0; i < bankStatement.length; i++) {
		if (bankStatement[i][sumkey] < 0) {
			// create new expenses array
			output.entries.push(bankStatement[i])        
			// sum up total
			output.total += bankStatement[i][sumkey]
		}
	}
	output.total = Math.round(output.total)

	return output
}

function getIncome(bankStatement, sumkey) {
	const output = {}
	output.total = 0
	output.entries = []
	for (var i = 0; i < bankStatement.length; i++) {
		if (bankStatement[i][sumkey] > 0) {
			// create new income array
			output.entries.push(bankStatement[i])
			// sum up total
			output.total += bankStatement[i][sumkey]
		}
	}
	output.total = Math.round(output.total)
	return output
}



function getDifference(expenses, income) {
	const difference = income.total + expenses.total
	return Math.round(difference)
}


function renderItems(bankStatement, sumkey, datekey, recipientkey) {
	document.getElementById('list').innerHTML = ''
	for (let i = 0; i < bankStatement.length; i++) {
		let li = document.createElement('li')
		li.innerHTML = `${bankStatement[i][datekey].toDateString()} | ${bankStatement[i][sumkey]} | ${bankStatement[i][recipientkey]}`
		document.getElementById('list').appendChild(li)
	}
}


// Cleans up recipient names so that they can more easily be grouped
function cleanRecipients(data, recipientkey) {
	const recipients = []
	let regex = /\b[a-zA-Z]*\s[a-zA-Z]*|\b[a-zA-Z]*/
	data.forEach(function (item) {
		let match = regex.exec(item[recipientkey].toLowerCase())[0].trim()
		item[recipientkey] = match
		if (recipients.indexOf(match) < 0)
			recipients.push(match)
	})
	return recipients
}

function groupTransactionsByRecipient(recipients, sumkey, recipientkey) {
	const groupedTransactions = []
	recipients.forEach(function (rec) {
		const obj = {}
		obj['Recipient'] = rec
		obj['Transactions'] = []
		groupedTransactions.push(obj)
	})

	for (let i = 0; i < data.length; i++) {
		for (let y = 0; y < groupedTransactions.length; y++) {
			if (data[i][recipientkey] == groupedTransactions[y]['Recipient'])
				groupedTransactions[y]['Transactions'].push(data[i])
		}
	}

	groupedTransactions.forEach(function (item) {
		let total = 0
		const transactions = item['Transactions']
		for (let i = 0; i < transactions.length; i++) {
			total = total + transactions[i][sumkey]
		}
		item['Total'] = total
	})

	groupedTransactions.sort(function (a, b) {
		if (a['Total'] < b['Total']) {
			return -1
		} else if (b['Total'] > a['Total']) {
			return 1
		} else {
			return 0
		}
	})
     
	return groupedTransactions

}

function renderGroupedItemsTotal(groupeditems) {
	document.getElementById('list').innerHTML = ''
	groupeditems.forEach(function (item) {
		let li = document.createElement('li')
		li.innerHTML = `${item['Recipient'].toUpperCase()}: ${Math.floor(item['Total'])}`
		document.getElementById('list').appendChild(li)
	})
}

function moveProgress() {
	let i = 0
	if (i == 0) {
		i = 1
		const elem = document.getElementById('progress-bar')
		elem.style.width = 0 + '%'
		elem.classList.toggle('hide')
		let width = 0
		let id = setInterval(frame, 1000)

		function frame() {
			if (width >= 100) {
				clearInterval(id)
				i = 0
				elem.classList.toggle('hide')
			} else {
				width = width + 50
				elem.style.width = width + '%'
			}
		}
	}
}



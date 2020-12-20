let output
let data 

let uploadCSVFile = document.getElementById('csv-file')
uploadCSVFile.addEventListener('change', function (event) {
	const reader = readFile(event.target.files[0])
	if (reader != undefined) {
	reader.onload = function (event) {
		  data = convertCSV(event.target.result)
		if (data) {
			// Saving data to local storage so that it doesn't have to be read from a file every time
			localStorage.setItem('data', JSON.stringify(data))
		} else {
			alert('Something went wrong with converting the file')
		}
		}
	} else {
		alert('Something went wrong with reading the file')
	}
	
	moveProgress()
	setTimeout(function () {
		headerMapper(data, 'headers-map-sum')
		headerMapper(data, 'headers-map-date')
		headerMapper(data, 'headers-map-recipient')
		document.getElementById('field-maps').classList.remove('hide')
	}, 3000)

})


let processDataButton = document.getElementById('process-data')
processDataButton.addEventListener('click', function () {
	const {
		sumkey,
		datekey,
		recipientkey,
		dateformat
	} = getInputFieldIDKeys()

	const outputFieldIDs = ['start-date', 'end-date', 'income', 'expenses', 'difference']
	outputFieldIDs.forEach(function (ID) {
		document.getElementById(ID).innerText = ''
	})
	data = getData()
	output = main(data, datekey, sumkey, dateformat)
	renderItems(output.expenses.entries, sumkey, datekey, recipientkey)
	document.getElementById('income').innerText = '+' + output.income.total
	document.getElementById('expenses').innerText = output.expenses.total
	document.getElementById('difference').innerText = output.difference

	var ungroup = document.getElementById('ungroup-button')
	var group = document.getElementById('group-recipient-button')
	if (!ungroup.classList.contains('hide')) {
		ungroup.classList.toggle('hide')
		group.classList.toggle('hide')
	}

})

let incomeButton = document.getElementById('income')
incomeButton.addEventListener('click', function () {
	let keys = getInputFieldIDKeys()
	renderItems(output.income.entries, keys.sumkey, keys.datekey, keys.recipientkey)
})

let expensesButton = document.getElementById('expenses')
expensesButton.addEventListener('click', function () {
	let keys = getInputFieldIDKeys()
	renderItems(output.expenses.entries, keys.sumkey, keys.datekey, keys.recipientkey)

})



let groupRecipientButton = document.getElementById('group-recipient-button')
groupRecipientButton.addEventListener('click', function () {
	const { sumkey, recipientkey, datekey, dateformat } = getInputFieldIDKeys()	
	data = getData()
	output = main(data, datekey, sumkey, dateformat)
	let recipients = cleanRecipients(output.expenses.entries, recipientkey)
	let grouped = groupTransactionsByRecipient(recipients, sumkey, recipientkey)	
	groupRecipientButton.classList.toggle('hide')
	document.getElementById('ungroup-button').classList.toggle('hide')
	renderGroupedItemsTotal(grouped)

})


let ungroupButton = document.getElementById('ungroup-button')
ungroupButton.addEventListener('click', function () {
	const { sumkey, datekey, recipientkey, dateformat } = getInputFieldIDKeys()
	ungroupButton.classList.toggle('hide')
	document.getElementById('group-recipient-button').classList.toggle('hide')
	data = getData()
	output = main(data, datekey, sumkey, dateformat)
	renderItems(output.expenses.entries, sumkey, datekey, recipientkey)
})




const inputsIDs = [ 'delimiter', 'dateformat']
for (let ID of inputsIDs) {
	let input = document.getElementById(ID)
	input.addEventListener('change', function () {
		let file = document.getElementById('csv-file')
		if (file.files[0]) {
			readFile(file.files[0])
			moveProgress()
			setTimeout(function () {
				headerMapper(data, 'headers-map-sum')
				headerMapper(data, 'headers-map-date')
				headerMapper(data, 'headers-map-recipient')
			}, 3000)
		} 
	})
}

    


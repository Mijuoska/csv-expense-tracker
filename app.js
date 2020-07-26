const output = {}

let uploadCSVFile = document.getElementById('csv-file')
uploadCSVFile.addEventListener('change', function (e) {
	readFile(e.target.files[0])
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
	let converted = convertToNumbers(data, sumkey)
	if (typeof converted[0][datekey] != 'object') {
		converted = convertDates(converted, datekey, dateformat)
	}
	let sorted = sortByDate(converted, datekey)
	populateDates(sorted, datekey)
	output.expenses = getExpenses(sorted, sumkey)
	output.income = getIncome(sorted, sumkey)
	output.difference = getDifference(output.expenses, output.income)
	renderItems(output.income.entries, sumkey, datekey, recipientkey)
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

incomeButton = document.getElementById('income')
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
	const { sumkey, recipientkey } = getInputFieldIDKeys()
	let recipients = cleanRecipients(output.expenses.entries, recipientkey)
	let grouped = groupTransactionsByRecipient(recipients, sumkey, recipientkey)
	groupRecipientButton.classList.toggle('hide')
	document.getElementById('ungroup-button').classList.toggle('hide')
	renderGroupedItemsTotal(grouped)

})


let ungroupButton = document.getElementById('ungroup-button')
ungroupButton.addEventListener('click', function () {
	const { sumkey, datekey, recipientkey } = getInputFieldIDKeys()
	ungroupButton.classList.toggle('hide')
	document.getElementById('group-recipient-button').classList.toggle('hide')
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

    


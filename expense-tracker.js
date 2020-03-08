

let dataArr;

let processDataButton = document.getElementById('process-data')
    processDataButton.addEventListener('click', function () {
            let sumkey = document.getElementById('headers-map-sum').value
            let datekey = document.getElementById('headers-map-date').value
            let recipientkey = document.getElementById('headers-map-recipient').value
            let dateformat = document.getElementById('date-format').value;
            dataArr = processData(sumkey, datekey, recipientkey, dateformat);
            document.getElementById('income').innerText = "+" + dataArr[0][1];
            document.getElementById('expenses').innerText = dataArr[1][1];
            document.getElementById('difference').innerText = dataArr[2];
           
    });


    function getData() {
        const data = localStorage.getItem('data')
        try {
            return data ? JSON.parse(data) : []
        } catch (e) {
            return []
        }
    }

    function clearValues() {
        document.getElementById('start-date').innerText = ""
        document.getElementById('end-date').innerText = ""
        document.getElementById('income').innerText = ""
        document.getElementById('expenses').innerText = ""
        document.getElementById('difference').innerText = "";
    }


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

 });


incomeButton = document.getElementById('income')
expensesButton = document.getElementById('expenses')

incomeButton.addEventListener('click', function () {
    let sumkey = document.getElementById('headers-map-sum').value
    let datekey = document.getElementById('headers-map-date').value
    let recipientkey = document.getElementById('headers-map-recipient').value
    renderItems(dataArr[0][0], sumkey, datekey, recipientkey)
});



expensesButton.addEventListener('click', function () {
     let sumkey = document.getElementById('headers-map-sum').value
     let datekey = document.getElementById('headers-map-date').value
     let recipientkey = document.getElementById('headers-map-recipient').value
     renderItems(dataArr[1][0], sumkey, datekey, recipientkey)
    
    });



 let groupRecipientButton = document.getElementById('group-recipient-button');
 groupRecipientButton.addEventListener('click', function (e) {
    let sumkey = document.getElementById('headers-map-sum').value
    let grouped = groupTransactionsByRecipient(dataArr[1][0], sumkey);
    renderGroupedItemsTotal(grouped)


 });


function moveProgress() {
    let i = 0;
    if (i == 0) {
        i = 1;
        let elem = document.getElementById("progress-bar");
        elem.style.width = 0 + "%"
        elem.classList.toggle('hide')
        let width = 0;
        let id = setInterval(frame, 1000);
        function frame() {
            if (width >= 100) {
                clearInterval(id);
                i = 0;
                elem.classList.toggle('hide')
            } else {
                width = width + 50;
                elem.style.width = width + "%";
            }
        }
    }
}



function headerMapper(data, element) {
    let headers
    if (data) {
    headers = Object.keys(data[0]);
    } else {
        return 
    }
    let select = document.getElementById(element)
    let container = document.getElementById('field-maps')
    let options = []

  // create regex arrays for automapping
  let regexArr
  if (element == 'headers-map-sum') {
      regexArr = [/\bSum/, /\bAmount/, /\bMäär/]
  } else if (element == 'headers-map-date') {
      regexArr = [/\b(D|d)ate\b/, /päivä\b/ ]
  } else if (element == 'headers-map-recipient') {
      regexArr = [/\bRec/, /\bSaa/]
  }
  let match
  let matchArr = []

    // remove previous options from a previous file upload
    if (select.options.length > 0) {
    for (var i = 0; i < options.length; i++) {
        options.pop()
    }
    select.innerHTML = ""
}


    // create options for each header
    headers.forEach(function (header) {
        options.push(document.createElement('option'));
        options[headers.indexOf(header)].value = header
        options[headers.indexOf(header)].innerText = header


    // match regex for auto-map below
regexArr.forEach(function (regex) {
 if (header.match(regex)) {
     match = header.match(regex)
     matchArr.push(match)
 }
});
       

    });
    options.forEach(function (option) {
        select.appendChild(option)
    });

    // auto-map options value
    if (matchArr[0]) {
    select.value = matchArr[0].input 
}
    container.classList.toggle = 'hide'    
}




function processData(sumkey, datekey, recipientkey, dateformat) {
     clearValues()
    data = getData()
     let converted = convertToNumbers(data, sumkey)
     if (typeof converted[0][datekey] != 'object') {
     converted = convertDates(converted, datekey, dateformat)
     }
     let sorted = sortByDate(converted, datekey)
     populateDates(sorted, datekey)
     let expenses = getExpenses(sorted, datekey, sumkey, recipientkey)
     let income = getIncome(sorted, datekey, sumkey, recipientkey)
     let difference = getDifference(expenses, income)
    renderItems(income[0], sumkey, datekey, recipientkey)
     return [income, expenses, difference] // income and expenses are arrays
}


function populateDates(sortedArr, datekey) {
    let dates = document.getElementById('dates')
    if (dates.classList.value == 'hide') {
        dates.classList.toggle('hide')
    }
    document.getElementById('start-date').innerText = sortedArr[0][datekey].toDateString()
    document.getElementById('end-date').innerText = sortedArr[sortedArr.length - 2][datekey].toDateString()
}

function convertToNumbers(bankStatement, sumkey) {
    bankStatement.forEach(function (entry) {
        entry[sumkey] = parseFloat(entry[sumkey]);
    });
    return bankStatement
}


function convertDates(bankStatement, datekey, format) {
    console.log("Inside convert dates bankStatement: " + bankStatement[0][datekey])
    console.log("inside convert dates datekey: " + datekey)
    console.log(format)
    // if format is mm.dd.yyyy, dd/mm/yyyy, dd.mm.yyyy, we have to convert
    for (let i = 0; i < bankStatement.length; i++) {
        let temp
        let outputDate
    switch(format) {
        case 'dd.mm.yyyy':
        temp = bankStatement[i][datekey].split('.');
        temp.unshift(temp[1]);
        temp.splice(2, 1);
        outputDate = temp.join('/');
        break;
    case 'mm.dd.yyyy':
        temp = bankStatement[i][datekey].split('.');
        outputDate = temp.join('/');
        break;
    case 'dd/mm/yyyy':
     temp = bankStatement[i][datekey].split('/');
     temp.unshift(temp[1]);
     temp.splice(2, 1);
     outputDate = temp.join('/');
     break;
     default:
         outputDate = bankStatement[i][datekey]
     }
    bankStatement[i][datekey] = new Date(outputDate);
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
    });
    return bankStatement
}


function getExpenses(bankStatement, datekey, sumkey, recipientkey) {
    let total = 0;
    let expenses = []
    for (let i = 0; i < bankStatement.length; i++) {
        if (bankStatement[i][sumkey] < 0) {
        // create new expenses array
        expenses.push(bankStatement[i])        
        // sum up total
        total += bankStatement[i][sumkey];
        }
    }
    return [expenses, Math.round(total)]
}

function getIncome(bankStatement, datekey, sumkey, recipientkey) {
   let total = 0;
   let income = []
   for (var i = 0; i < bankStatement.length; i++) {
        if (bankStatement[i][sumkey] > 0) {
            // create new income array
            income.push(bankStatement[i])
           // sum up total
           total += bankStatement[i][sumkey];
       }
   }

   return [income, Math.round(total)]
   }



function getDifference(expensesArr, incomeArr) {
    let difference = incomeArr[1] + expensesArr[1];
    return Math.round(difference)
}


function renderItems(bankStatement, sumkey, datekey, recipientkey) {
    document.getElementById('list').innerHTML = "";
    for (let i = 0; i < bankStatement.length; i++) {
    let li = document.createElement('li')
    li.innerHTML = `${bankStatement[i][datekey].toDateString()} | ${bankStatement[i][sumkey]} | ${bankStatement[i][recipientkey]}`
    document.getElementById('list').appendChild(li)
    }
}

function groupTransactionsByRecipient(data, sumkey) {
    recipients = []
    let regex = /\b[a-zA-Z]*\s[a-zA-Z]*|\b[a-zA-Z]*/
    // Parse and clean up recipient names for grouping
    data.forEach(function (item) {
        let match = regex.exec(item['Saajan nimi'].toLowerCase())[0].trim();
        item['Saajan nimi'] = match;
        if (recipients.indexOf(match) < 0)
            recipients.push(match)
    });
    // Create an array where we store the grouped transactions
    let groupedTransactions = []
    recipients.forEach(function (rec) {
        let obj = {};
        obj['Recipient'] = rec;
        obj['Transactions'] = []
        groupedTransactions.push(obj)
    });

    // Do the actual sorting
    for (let i = 0; i < data.length; i++) {
        for (let y = 0; y < groupedTransactions.length; y++) {
            if (data[i]['Saajan nimi'] == groupedTransactions[y]['Recipient'])
                groupedTransactions[y]['Transactions'].push(data[i])
        }
    }

    // sum up totals
    groupedTransactions.forEach(function (item) {
        let total = 0;
        let transactions = item['Transactions'];
        for (let i = 0; i < transactions.length; i++) {
            total = total + transactions[i][sumkey]
        }
      item['Total'] = total;
    });

    // sort

      groupedTransactions.sort(function (a, b) {
          if (a['Total'] < b['Total']) {
              return -1
          } else if (b['Total'] > a['Total']) {
              return 1
          } else {
              return 0
          }
      });
     
    return groupedTransactions

}

function renderGroupedItemsTotal(groupeditems) {
    document.getElementById('list').innerHTML = ""
    groupeditems.forEach(function (item) {
        let li = document.createElement('li');
     li.innerHTML = `${item['Recipient'].toUpperCase()}: ${Math.floor(item['Total'])}`
     document.getElementById('list').appendChild(li);
});
};
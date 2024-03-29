// BUDGET CONTROLLER
var budgetController = (() => {

    class Commun {

        constructor(id, description, value, datePrel, categorie = 'Standard'){
            this.id = id;
            this.description = description;
            this.value = value 
            this.datePrel = datePrel;
            this.categorie = categorie;
        }
    }

    class Expense extends Commun {

        constructor(id, description, value, datePrel, categorie){
            super(id, description, value, datePrel, categorie);
            this.percentage = -1
        }

        calcPercentage(totalIncome) {

            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        }

        getPercentage() {
            return this.percentage;
        }
    }

    class Income extends Commun {

        constructor(id, description, value, datePrel, categorie){
            super(id, description, value, datePrel, categorie);
        }
    }

    const calculateTotal = type => {
        let sum = 0;
        data.allItems[type].forEach(cur => {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage:-1
    };

    return {
        addItem: (type, des, val, datep, cat) => {

            let newItem, ID;

            // Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // check date
            if(datep === 'NaN-NaN-NaN'){
                datep = '--/--/--';
            }
            
            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val, datep, cat);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val, datep, cat);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
            
        },

        deleteItem: (type, id) => {
            let ids, index;
            
            // id = 6
            //data.allItems[type][id]
            // ids = [1 2 4  8]
            // index = 3
            ids = data.allItems[type].map(current => {
                return current.id;

            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }

        },

        calculateBudget: () => {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages: () => {

            /*
            a=20 
            b=10
            c=40
            income = 100
            a=20/100=20%
            */

            data.allItems.exp.forEach(cur => {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: () => {
            let allPerc = data.allItems.exp.map(cur => {
                return cur.getPercentage();
            });
            return allPerc
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: () => {
            console.log(data);
        }
    };

})();


// UI CONTROLLER
var UIController = (() => {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputCategorie: '.add__categorie',
        inputValue: '.add__value',
        inputDate: '.add__date',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    
    const formatNumber = (num, type) => {
        let numSplit, int, dec; // var type
        /*
        + or - before number
        exactly 2 decimal point
        comma separating the thousands

        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, int.length); //input 2310, output 2,310
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign  = '-' : sign = '+') + ' ' + int + '.' +  dec;

    };

    const nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
            
        }
        // for (let i of list) {
        //     callback(list[i], i);
            
        // }
    };

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value, 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value), // ParseFloat, convert in decimal and allow to calculate budget
                datePrel: new Date(document.querySelector(DOMstrings.inputDate).value).getDate()
                + '-' + new Date(document.querySelector(DOMstrings.inputDate).value).getMonth()
                + '-' + new Date(document.querySelector(DOMstrings.inputDate).value).getFullYear(),
                categorie: document.querySelector(DOMstrings.inputCategorie).value
            };
        },

        addListItem: (obj, type) => {
            let html, newHtml, element;

            // Create HTML string with placeholder text

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__badge">%categorie%</div><div class="item__date">%date%</div><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__badge">%categorie%</div><div class="item__date">%date%</div><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%date%', obj.datePrel);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            newHtml = newHtml.replace('%categorie%', obj.categorie);
            
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            //ColorSwap Categorie Badge
            let badge = document.querySelector(DOMstrings.inputCategorie);
            if(badge.value === 'Important') {
                badge.style.backgroundColor = "#FF5049";
            } else if(badge.value === 'Loisirs') {
                badge.style.backgroundColor = "#1EA9FA";
            } else if(badge.value === 'Food') {
                badge.style.backgroundColor = "#36BA97";
            } else if(badge.value === 'Others') {
                badge.style.backgroundColor = "#FACA2B";
            } else {
                badge.style.backgroundColor = "red";
            }
            

        },

        deleteListItem: selectorID => {
            let el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },

        clearFields: () => {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue + ', ' + DOMstrings.inputDate);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current, index, array) => {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: obj => {

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';  
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: percentages => {

            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, (current, index) => {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }else {
                    current.textContent = '---';
                }
                
            });

        },

        displayMonth: () => {
            let now, months, month, year;
          
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();  
            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;

        },

        changeType: () => {

            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue + ',' +
                DOMstrings.inputDate);


            nodeListForEach(fields, cur => {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: () => {
            return DOMstrings;
        }
    }

})();


// GLOBAL APP CONTROLLER
var controller = ((budgetCtrl, UICtrl) => {

    const setupEventListeners = () => {
        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', event => {
    
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    const updateBudget = () => {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    const updatePercentages = () => {

        // 1. calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percetanges from the budget controller
        let percentages = budgetCtrl.getPercentages();

        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    const ctrlAddItem = () => {
        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

        // 2. Add the item to the dudget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value, input.datePrel, input.categorie);

        // 3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        // 4. Clear the fields
        UICtrl.clearFields();

        // 5. Calculate an update budget
        updateBudget();

        // 6. Calculate and update the percentages
        updatePercentages();
        }

    };

    const ctrlDeleteItem = event => {
        let itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

             // 4. Calculate and update the percentages
            updatePercentages();
        }
    }

    return {
        init: function() {
            console.log('Ready');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();
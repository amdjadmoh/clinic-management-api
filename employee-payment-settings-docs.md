# Employee Payment Settings Documentation

The **Update Employee Payment Settings** endpoint (`PUT /employees/:employeeId/payment-settings`) accepts a JSON body with a `settings` array. Each object in the array defines a specific component of the employee's compensation package.

Here are the complete fields, available payment setting types, and example request payloads.

## Request Body Field Definitions

Each object inside the `settings` array can have the following properties:

| Field | Type | Description |
| :--- | :--- | :--- |
| **`type`** <br>*(Required)* | `string` | The calculation type. Must be one of:<br>• `fixed_monthly`<br>• `hourly`<br>• `consultation_percentage` (or `patient_consultation_percentage`)<br>• `procedure_percentage`<br>• `fixed_extra_bonus`<br>• `non_fixed_bonus` |
| **`value`** <br>*(Required)* | `decimal` | The monetary amount, rate, or percentage percentage (e.g., `60000`, `150`, or `10`). |
| **`description`** <br>*(Optional)* | `string` | A human-readable description of what this payment setting represents. |
| **`expectedDays`** <br>*(Optional)* | `integer` | *Only applicable for `fixed_monthly`*. The expected number of working days per month. Defaults to `30`. |
| **`procedureId`** <br>*(Optional)* | `integer` | *Only applicable for `procedure_percentage`*. Filters commission to only apply to a specific predefined procedure ID. If omitted, applies to all procedures. |

---

### 1. Fixed Monthly Salary
Used for standard salaried employees. Daily rate is calculated as `value / expectedDays`, and deductions are made for absences.

```json
{
  "settings": [
    {
      "type": "fixed_monthly",
      "value": 75000,
      "description": "Standard monthly base salary",
      "expectedDays": 22
    }
  ]
}
```

### 2. Hourly Wage Configuration
Calculates earnings dynamically based on the total number of hours recorded in the attendance logs (`hoursWorked * value`).

```json
{
  "settings": [
    {
      "type": "hourly",
      "value": 450,
      "description": "Part-time receptionist hourly rate of 450 DZD"
    }
  ]
}
```

### 3. Consultation Commissions (for Doctors)
Applies a percentage or flat bonus per consultation:
* **Percentage calculation**: If `value <= 100`, it calculates a percentage of the total procedure costs.
* **Flat rate calculation**: If `value > 100`, it calculates a flat monetary rate per patient.

```json
{
  "settings": [
    {
      "type": "consultation_percentage",
      "value": 15,
      "description": "15% commission on all completed patient consultations"
    }
  ]
}
```

### 4. Specific Procedure Commissions
Configures commission parameters for medical procedures:
* If a `procedureId` is specified, the rate or percentage applies only to that exact procedure.
* If `procedureId` is omitted, it applies to all procedures performed by the doctor.

```json
{
  "settings": [
    {
      "type": "procedure_percentage",
      "value": 10,
      "procedureId": 3,
      "description": "10% commission on Dental Fillings (Procedure ID 3)"
    },
    {
      "type": "procedure_percentage",
      "value": 500,
      "procedureId": 5,
      "description": "Flat 500 DZD commission on Teeth Whitening (Procedure ID 5)"
    }
  ]
}
```

### 5. Extra & Non-fixed Bonuses
Adds flat-rate monthly allowances or target bonuses.

```json
{
  "settings": [
    {
      "type": "fixed_extra_bonus",
      "value": 8000,
      "description": "Fixed monthly transport allowance"
    },
    {
      "type": "non_fixed_bonus",
      "value": 12000,
      "description": "Performance-based bonus"
    }
  ]
}
```

### 6. Full Hybrid Example (Salaried Doctor + Extras + Commissions)
You can combine multiple options to build complex, hybrid compensation packages for your staff:

```json
{
  "settings": [
    {
      "type": "fixed_monthly",
      "value": 120000,
      "description": "Doctor Base Salary",
      "expectedDays": 22
    },
    {
      "type": "consultation_percentage",
      "value": 10,
      "description": "10% general consultation share"
    },
    {
      "type": "procedure_percentage",
      "value": 20,
      "procedureId": 12,
      "description": "20% specialized surgical procedure share"
    },
    {
      "type": "fixed_extra_bonus",
      "value": 15000,
      "description": "Medical board premium bonus"
    }
  ]
}
```

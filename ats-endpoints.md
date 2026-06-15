# ATS (Attestation de Travail et de Salaire) API Endpoints

This document describes the REST API endpoints available for managing ATS documents and salary histories under the `/ats` path.

---

## Endpoint Summary

| Method | Route | Description |
| :--- | :--- | :--- |
| **POST** | `/ats` | Create a new ATS document with optional salary history |
| **GET** | `/ats` | Retrieve all ATS documents |
| **GET** | `/ats/:id` | Retrieve a single ATS document by ID with its salary history |
| **PUT** | `/ats/:id` | Update an existing ATS document and replace its salary history |
| **DELETE** | `/ats/:id` | Delete an ATS document (cascades delete to salary history) |

---

## 1. Create ATS Document (`POST /ats`)

Creates a new ATS document. All information is supplied directly in the request body.

### Request Body Schema

```json
{
  "agence": "Alger Ouest",
  "centrePaiement": "1203",
  "employerName": "Eurl El-Farabi Clinic",
  "employerAdherentNumber": "0987654321",
  "employerAddress": "12 Rue des Oliviers, Alger",
  "employeeNom": "Benali",
  "employeePrenom": "Mohamed",
  "employeeSocialSecurityNumber": "850912345678",
  "employeeDateOfBirth": "1985-09-12",
  "employeePlaceOfBirth": "Alger",
  "employeeAddress": "Rue Didouche Mourad, Alger",
  "employeeProfession": "Infirmier Principal",
  "dateRecrutement": "2020-01-15",
  "dateDernierJourTravail": "2026-06-01",
  "dateRepriseTravail": "2026-06-15",
  "nonReprisCeJour": false,
  "dureeMoins6mJours": 14,
  "dureeMoins6mHeures": 112,
  "dureeMoins6mDu": "2026-06-01",
  "dureeMoins6mAu": "2026-06-14",
  "dureePlus6mJours": null,
  "dureePlus6mHeures": null,
  "dureePlus6mDu": null,
  "dureePlus6mAu": null,
  "volumeHoraireJournalier": 8.00,
  "faitA": "Alger",
  "faitLe": "2026-06-10",
  "signataireNomPrenomQualite": "Amine Mansouri - Directeur RH",
  "salaryHistory": [
    {
      "referencePeriod": "MAI 2026",
      "joursTravailles": "30 jours",
      "motifAbsence": "/",
      "salaireCotisable": 45000.00,
      "cotisationOuvriere": 4050.00
    },
    {
      "referencePeriod": "AVRIL 2026",
      "joursTravailles": "30 jours",
      "motifAbsence": "Maladie (2 jours)",
      "salaireCotisable": 42000.00,
      "cotisationOuvriere": 3780.00
    }
  ]
}
```

### Successful Response (`201 Created`)

```json
{
  "status": "success",
  "data": {
    "ats": {
      "id": 1,
      "agence": "Alger Ouest",
      "centrePaiement": "1203",
      "employerName": "Eurl El-Farabi Clinic",
      "employerAdherentNumber": "0987654321",
      "employerAddress": "12 Rue des Oliviers, Alger",
      "employeeNom": "Benali",
      "employeePrenom": "Mohamed",
      "employeeSocialSecurityNumber": "850912345678",
      "employeeDateOfBirth": "1985-09-12",
      "employeePlaceOfBirth": "Alger",
      "employeeAddress": "Rue Didouche Mourad, Alger",
      "employeeProfession": "Infirmier Principal",
      "dateRecrutement": "2020-01-15",
      "dateDernierJourTravail": "2026-06-01",
      "dateRepriseTravail": "2026-06-15",
      "nonReprisCeJour": false,
      "dureeMoins6mJours": 14,
      "dureeMoins6mHeures": 112,
      "dureeMoins6mDu": "2026-06-01",
      "dureeMoins6mAu": "2026-06-14",
      "dureePlus6mJours": null,
      "dureePlus6mHeures": null,
      "dureePlus6mDu": null,
      "dureePlus6mAu": null,
      "volumeHoraireJournalier": "8.00",
      "faitA": "Alger",
      "faitLe": "2026-06-10",
      "signataireNomPrenomQualite": "Amine Mansouri - Directeur RH",
      "updatedAt": "2026-06-10T20:15:00.000Z",
      "createdAt": "2026-06-10T20:15:00.000Z"
    },
    "salaryHistory": [
      {
        "id": 1,
        "atsId": 1,
        "referencePeriod": "MAI 2026",
        "joursTravailles": "30 jours",
        "motifAbsence": "/",
        "salaireCotisable": "45000.00",
        "cotisationOuvriere": "4050.00",
        "updatedAt": "2026-06-10T20:15:00.000Z",
        "createdAt": "2026-06-10T20:15:00.000Z"
      },
      {
        "id": 2,
        "atsId": 1,
        "referencePeriod": "AVRIL 2026",
        "joursTravailles": "30 jours",
        "motifAbsence": "Maladie (2 jours)",
        "salaireCotisable": "42000.00",
        "cotisationOuvriere": "3780.00",
        "updatedAt": "2026-06-10T20:15:00.000Z",
        "createdAt": "2026-06-10T20:15:00.000Z"
      }
    ]
  }
}
```

---

## 2. Get All ATS Documents (`GET /ats`)

Retrieves a list of all saved ATS documents.

### Successful Response (`200 OK`)

```json
{
  "status": "success",
  "results": 1,
  "data": {
    "documents": [
      {
        "id": 1,
        "agence": "Alger Ouest",
        "centrePaiement": "1203",
        "employerName": "Eurl El-Farabi Clinic",
        "employerAdherentNumber": "0987654321",
        "employerAddress": "12 Rue des Oliviers, Alger",
        "employeeNom": "Benali",
        "employeePrenom": "Mohamed",
        "employeeSocialSecurityNumber": "850912345678",
        "employeeDateOfBirth": "1985-09-12",
        "employeePlaceOfBirth": "Alger",
        "employeeAddress": "Rue Didouche Mourad, Alger",
        "employeeProfession": "Infirmier Principal",
        "dateRecrutement": "2020-01-15",
        "dateDernierJourTravail": "2026-06-01",
        "dateRepriseTravail": "2026-06-15",
        "nonReprisCeJour": false,
        "dureeMoins6mJours": 14,
        "dureeMoins6mHeures": 112,
        "dureeMoins6mDu": "2026-06-01",
        "dureeMoins6mAu": "2026-06-14",
        "dureePlus6mJours": null,
        "dureePlus6mHeures": null,
        "dureePlus6mDu": null,
        "dureePlus6mAu": null,
        "volumeHoraireJournalier": "8.00",
        "faitA": "Alger",
        "faitLe": "2026-06-10",
        "signataireNomPrenomQualite": "Amine Mansouri - Directeur RH",
        "createdAt": "2026-06-10T20:15:00.000Z",
        "updatedAt": "2026-06-10T20:15:00.000Z"
      }
    ]
  }
}
```

---

## 3. Get Single ATS Document (`GET /ats/:id`)

Retrieves a single ATS document including all its associated salary history rows.

### Successful Response (`200 OK`)

```json
{
  "status": "success",
  "data": {
    "ats": {
      "id": 1,
      "agence": "Alger Ouest",
      "centrePaiement": "1203",
      "employerName": "Eurl El-Farabi Clinic",
      "employerAdherentNumber": "0987654321",
      "employerAddress": "12 Rue des Oliviers, Alger",
      "employeeNom": "Benali",
      "employeePrenom": "Mohamed",
      "employeeSocialSecurityNumber": "850912345678",
      "employeeDateOfBirth": "1985-09-12",
      "employeePlaceOfBirth": "Alger",
      "employeeAddress": "Rue Didouche Mourad, Alger",
      "employeeProfession": "Infirmier Principal",
      "dateRecrutement": "2020-01-15",
      "dateDernierJourTravail": "2026-06-01",
      "dateRepriseTravail": "2026-06-15",
      "nonReprisCeJour": false,
      "dureeMoins6mJours": 14,
      "dureeMoins6mHeures": 112,
      "dureeMoins6mDu": "2026-06-01",
      "dureeMoins6mAu": "2026-06-14",
      "dureePlus6mJours": null,
      "dureePlus6mHeures": null,
      "dureePlus6mDu": null,
      "dureePlus6mAu": null,
      "volumeHoraireJournalier": "8.00",
      "faitA": "Alger",
      "faitLe": "2026-06-10",
      "signataireNomPrenomQualite": "Amine Mansouri - Directeur RH",
      "createdAt": "2026-06-10T20:15:00.000Z",
      "updatedAt": "2026-06-10T20:15:00.000Z",
      "atsSalaryHistories": [
        {
          "id": 1,
          "atsId": 1,
          "referencePeriod": "MAI 2026",
          "joursTravailles": "30 jours",
          "motifAbsence": "/",
          "salaireCotisable": "45000.00",
          "cotisationOuvriere": "4050.00",
          "createdAt": "2026-06-10T20:15:00.000Z",
          "updatedAt": "2026-06-10T20:15:00.000Z"
        },
        {
          "id": 2,
          "atsId": 1,
          "referencePeriod": "AVRIL 2026",
          "joursTravailles": "30 jours",
          "motifAbsence": "Maladie (2 days)",
          "salaireCotisable": "42000.00",
          "cotisationOuvriere": "3780.00",
          "createdAt": "2026-06-10T20:15:00.000Z",
          "updatedAt": "2026-06-10T20:15:00.000Z"
        }
      ]
    }
  }
}
```

---

## 4. Update ATS Document (`PUT /ats/:id`)

Updates an existing ATS document. If `salaryHistory` is passed in the request body, all previous salary history rows are completely replaced.

### Successful Response (`200 OK`)

Matches the structural output format of the `POST /ats` endpoint.

---

## 5. Delete ATS Document (`DELETE /ats/:id`)

Deletes the specified ATS document. Associated salary history lines are deleted automatically by database cascade constraints.

### Successful Response (`204 No Content`)

*(No response body content)*

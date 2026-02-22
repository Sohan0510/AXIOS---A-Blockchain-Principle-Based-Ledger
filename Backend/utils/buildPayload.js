function normalizeDate(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}

export function buildHashPayload(land) {
  return {
    identity: {
      landId: land.landId || null,
      landType: land.landType || null,
      surveyNumber: land.surveyNumber || null,
      subdivisionNumber: land.subdivisionNumber || null,
      village: land.village || null,
      taluk: land.taluk || null,
      district: land.district || null,
      state: land.state || null,
    },

    geo: {
      geoLatitude: land.geoLatitude ?? null,
      geoLongitude: land.geoLongitude ?? null,
    },

    area: {
      acres: land.area?.acres ?? null,
      guntas: land.area?.guntas ?? null,
      sqFt: land.area?.sqFt ?? null,
    },

    owner: {
      ownerName: land.owner?.ownerName || null,
      ownerId: land.owner?.ownerId || null,
      ownerType: land.owner?.ownerType || null,
      sharePercentage: land.owner?.sharePercentage ?? null,
    },

    transfer: {
      transferType: land.transfer?.transferType || null,
      transferDate: normalizeDate(land.transfer?.transferDate),
      registrationNumber: land.transfer?.registrationNumber || null,
      subRegistrarOffice: land.transfer?.subRegistrarOffice || null,
      saleValue: land.transfer?.saleValue ?? null,
    },

    mutation: {
      status: land.mutation?.status || null,
      requestDate: normalizeDate(land.mutation?.requestDate),
      approvalDate: normalizeDate(land.mutation?.approvalDate),
    },

    loan: {
      loanActive: land.loan?.loanActive ?? false,
      bankName: land.loan?.bankName || null,
      loanAmount: land.loan?.loanAmount ?? null,
    },

    legal: {
      courtCase: land.legal?.courtCase ?? false,
      caseNumber: land.legal?.caseNumber || null,
      caseStatus: land.legal?.caseStatus || null,
    },

    typeSpecific: buildTypeSpecificBlock(land),
  };
}

function buildTypeSpecificBlock(land) {
  switch (land.landType) {
    case "Agricultural":
      return {
        landNature: land.agriculturalDetails?.landNature || null,
        soilType: land.agriculturalDetails?.soilType || null,
        irrigationSource: land.agriculturalDetails?.irrigationSource || null,
        cropType: land.agriculturalDetails?.cropType || null,
        seasonalCrop: land.agriculturalDetails?.seasonalCrop || null,
        waterSource: land.agriculturalDetails?.waterSource || null,
        governmentSchemeEnrollment: land.agriculturalDetails?.governmentSchemeEnrollment || null,
        fertilityStatus: land.agriculturalDetails?.fertilityStatus || null,
      };

    case "Residential":
      return {
        builtUpArea: land.residentialDetails?.builtUpArea ?? null,
        numberOfFloors: land.residentialDetails?.numberOfFloors ?? null,
        constructionType: land.residentialDetails?.constructionType || null,
        occupancyType: land.residentialDetails?.occupancyType || null,
        propertyTaxCategory: land.residentialDetails?.propertyTaxCategory || null,
        waterConnection: land.residentialDetails?.waterConnection ?? null,
        electricityConnection: land.residentialDetails?.electricityConnection ?? null,
        yearOfConstruction: land.residentialDetails?.yearOfConstruction ?? null,
        parkingAvailability: land.residentialDetails?.parkingAvailability ?? null,
      };

    case "Commercial":
      return {
        businessType: land.commercialDetails?.businessType || null,
        builtUpArea: land.commercialDetails?.builtUpArea ?? null,
        zoningCategory: land.commercialDetails?.zoningCategory || null,
        rentalStatus: land.commercialDetails?.rentalStatus ?? null,
        tenantName: land.commercialDetails?.tenantDetails?.tenantName || null,
        leaseStartDate: normalizeDate(land.commercialDetails?.tenantDetails?.leaseStartDate),
        leaseEndDate: normalizeDate(land.commercialDetails?.tenantDetails?.leaseEndDate),
        rentAmount: land.commercialDetails?.tenantDetails?.rentAmount ?? null,
        fireSafetyClearance: land.commercialDetails?.fireSafetyClearance ?? null,
        tradeLicense: land.commercialDetails?.tradeLicense || null,
      };

    case "Industrial":
      return {
        factoryType: land.industrialDetails?.factoryType || null,
        storageCapacity: land.industrialDetails?.storageCapacity || null,
        pollutionClearance: land.industrialDetails?.pollutionClearance ?? null,
        industrialLicense: land.industrialDetails?.industrialLicense || null,
        powerRequirement: land.industrialDetails?.powerRequirement || null,
        hazardousMaterial: land.industrialDetails?.hazardousMaterial ?? null,
      };

    default:
      return {};
  }
}

export default buildHashPayload;

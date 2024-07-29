const orderFormatListDoc = [
    {
        fieldName: 'productOrderNo',
        headerName:'상품주문번호',
        isExtract: true,
    },
    {
        fieldName: 'orderNo',
        headerName:'주문번호',
        isExtract: true,
    },
    {
        fieldName: 'deliveryAttributeText',
        headerName:'배송속성',
        isExtract: false,
    },
    {
        fieldName: 'fulfillmentCompanyName',
        headerName:'풀필먼트사(주문 기준)',
        isExtract: false,
    },
    {
        fieldName: 'deliveryMethodPay',
        headerName:'배송방법(구매자 요청)',
        isExtract: true,
    },
    {
        fieldName: 'deliveryMethod',
        headerName:'배송방법',
        isExtract: false,
    },
    {
        fieldName: 'deliveryCompanyCode',
        headerName:'택배사',
        isExtract: false,
    },
    {
        fieldName: 'deliveryInvoiceNo',
        headerName:'송장번호',
        isExtract: false,
    },
    {
        fieldName: 'deliveryDateTime',
        headerName:'발송일',
        isExtract: true,
    },
    {
        fieldName: 'saleChannelType',
        headerName:'판매채널',
        isExtract: true,
    },
    {
        fieldName: 'orderMemberName',
        headerName:'구매자명',
        isExtract: true,
    },
    {
        fieldName: 'orderMemberId',
        headerName:'구매자ID',
        isExtract: true,
    },
    {
        fieldName: 'receiverName',
        headerName:'수취인명',
        isExtract: true,
    },
    {
        fieldName: 'orderStatus',
        headerName:'주문상태',
        isExtract: true,
    },
    {
        fieldName: 'productOrderStatus',
        headerName:'주문세부상태',
        isExtract: true,
    },
    {
        fieldName: 'payLocationType',
        headerName:'결제위치',
        isExtract: true,
    },
    {
        fieldName: 'payDateTime',
        headerName:'결제일',
        isExtract: true,
    },
    {
        fieldName: 'productNo',
        headerName:'상품번호',
        isExtract: true,
    },
    {
        fieldName: 'productName',
        headerName:'상품명',
        isExtract: true,
    },
    {
        fieldName: 'productClass',
        headerName:'상품종류',
        isExtract: true,
    },
    {
        fieldName: 'returnCareTarget',
        headerName:'반품안심케어',
        isExtract: true,
    },
    {
        fieldName: 'productOptionContents',
        headerName:'옵션정보',
        isExtract: true,
    },
    {
        fieldName: 'sellerOptionManagementCode',
        headerName:'옵션관리코드',
        isExtract: true,
    },
    {
        fieldName: 'orderQuantity',
        headerName:'수량',
        isExtract: true,
    },
    {
        fieldName: 'productOptionAmt',
        headerName:'옵션가격',
        isExtract: true,
    },
    {
        fieldName: 'productUnitPrice',
        headerName:'상품가격',
        isExtract: true,
    },
    {
        fieldName: 'totalDiscountAmt',
        headerName:'상품별 할인액',
        isExtract: true,
    },
    {
        fieldName: 'sellerDiscountAmt',
        headerName:'판매자 부담 할인액',
        isExtract: true,
    },
    {
        fieldName: 'productPayAmt',
        headerName:'상품별 총 주문금액',
        isExtract: true,
    },
    {
        fieldName: 'giftName',
        headerName:'사은품',
        isExtract: true,
    },
    {
        fieldName: 'placingOrderDateTime',
        headerName:'발주확인일',
        isExtract: true,
    },
    {
        fieldName: 'dispatchDueDateTime',
        headerName:'발송기한',
        isExtract: true,
    },
    {
        fieldName: 'dispatchDateTime',
        headerName:'발송처리일',
        isExtract: true,
    },
    {
        fieldName: 'waybillPrintDateTime',
        headerName:'송장출력일',
        isExtract: true,
    },
    {
        fieldName: 'deliveryFeeRatingClass',
        headerName:'배송비 형태',
        isExtract: true,
    },
    {
        fieldName: 'deliveryBundleGroupSeq',
        headerName:'배송비 묶음번호',
        isExtract: true,
    },
    {
        fieldName: 'deliveryFeeClass',
        headerName:'배송비 유형',
        isExtract: true,
    },
    {
        fieldName: 'deliveryFeeAmt',
        headerName:'배송비 합계',
        isExtract: true,
    },
    {
        fieldName: 'remoteAreaCostChargeAmt',
        headerName:'제주/도서 추가배송비',
        isExtract: true,
    },
    {
        fieldName: 'deliveryFeeDiscountAmt',
        headerName:'배송비 할인액',
        isExtract: true,
    },
    {
        fieldName: 'sellerProductManagementCode',
        headerName:'판매자 상품코드',
        isExtract: true,
    },
    {
        fieldName: 'sellerInternalCode1',
        headerName:'판매자 내부코드1',
        isExtract: true,
    },
    {
        fieldName: 'sellerInternalCode2',
        headerName:'판매자 내부코드2',
        isExtract: true,
    },
    {
        fieldName: 'receiverTelNo1',
        headerName:'수취인연락처1',
        isExtract: true,
    },
    {
        fieldName: 'receiverTelNo2',
        headerName:'수취인연락처2',
        isExtract: true,
    },
    {
        fieldName: 'receiverIntegratedAddress',
        headerName:'통합배송지',
        isExtract: true,
    },
    {
        fieldName: 'receiverDisplayBaseAddress',
        headerName:'기본배송지',
        isExtract: true,
    },
    {
        fieldName: 'receiverDisplayDetailAddress',
        headerName:'상세배송지',
        isExtract: true,
    },
    {
        fieldName: 'orderMemberTelNo',
        headerName:'구매자연락처',
        isExtract: true,
    },
    {
        fieldName: 'receiverZipCode',
        headerName:'우편번호',
        isExtract: true,
    },
    {
        fieldName: 'productOrderMemo',
        headerName:'배송메세지',
        isExtract: true,
    },
    {
        fieldName: 'takingGoodsPlaceAddress',
        headerName:'출고지',
        isExtract: true,
    },
    {
        fieldName: 'payMeansClass',
        headerName:'결제수단',
        isExtract: true,
    },
    {
        fieldName: 'commissionClassType',
        headerName:'수수료 과금구분',
        isExtract: true,
    },
    {
        fieldName: 'salesCommissionPrepay',
        headerName:'수수료결제방식',
        isExtract: true,
    },
    {
        fieldName: 'payCommissionAmt',
        headerName:'네이버페이 주문관리 수수료',
        isExtract: true,
    },
    {
        fieldName: 'knowledgeShoppingCommissionAmt',
        headerName:'매출연동 수수료',
        isExtract: true,
    },
    {
        fieldName: 'settlementExpectAmt',
        headerName:'정산예정금액',
        isExtract: true,
    },
    {
        fieldName: 'sellingInterlockCommissionInflowPath',
        headerName:'매출연동수수료 유입경로',
        isExtract: true,
    },
    {
        fieldName: 'individualCustomUniqueCode',
        headerName:'개인통관고유부호',
        isExtract: true,
    },
    {
        fieldName: 'orderDateTime',
        headerName:'주문일시',
        isExtract: true,
    },
    {
        fieldName: 'subscriptionPeriodCount',
        headerName:'구독신청회차',
        isExtract: true,
    },
    {
        fieldName: 'subscriptionRound',
        headerName:'구독진행회차',
        isExtract: true,
    },
    {
        fieldName: 'hopeDelivery',
        headerName:'배송희망일',
        isExtract: true,
    },
    {
        fieldName: 'storeName',
        headerName:'스토어명',
        isExtract: false,
    },
]

module.exports = {
    orderFormatListDoc
}

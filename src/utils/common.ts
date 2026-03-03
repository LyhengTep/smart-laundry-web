export const formatLaundryServiceType = (type: string) => {
  switch (type) {
    case "WASH":
      return "Wash & Fold";
    case "DRY_CLEAN":
      return "Dry Cleaning";
    case "IRON":
      return "Ironing";
    default:
      return type;
  }
};

export const getLaundryServicePic = (type: string) => {
  switch (type) {
    case "WASH":
      return "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop";
    case "DRY_CLEAN":
      return "https://images.unsplash.com/photo-1549037173-e3b717902c57?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    case "IRON":
      return "https://images.unsplash.com/photo-1662221156544-3355c817ed74?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    default:
      return "";
  }
};

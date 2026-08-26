class AppConfig {
  // Created immediately when the class is loaded
  private static readonly instance: AppConfig = new AppConfig();
  
  private constructor() {}

  public static getInstance(): AppConfig {
    return AppConfig.instance;
  }
}

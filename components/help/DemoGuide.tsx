"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface DemoSubFeature {
  text: string;
  image?: { src: string; alt: string };
}

interface DemoDetail {
  title: string;
  description: string;
  images?: { src: string; alt: string }[];
  subFeatures?: DemoSubFeature[];
}

interface DemoStep {
  step: number;
  title: string;
  description: string;
  details: Array<DemoDetail | string>;
}

const demoSteps: DemoStep[] = [
  {
    step: 1,
    title: "Understanding the Dashboard",
    description: `The Dashboard page is the main page and summerises most of the system data in form of graphs, charts and tables. It provides a quick overview of your business performance and key metrics.\n
    The dashboard is designed to give you a snapshot of your business at a glance, allowing you to monitor sales, inventory levels, and other important data without having to navigate through multiple pages.\n\n

    Sections of the dashboard include:\n
    1. KPIs (Key Performance Indicators): Displays total products, total sales, and inventory value.\n
    2. Graphs and Charts: Visual representations of sales trends, inventory levels, and other relevant data.\n
    3. Recent Activity: Shows the latest sales, stock movements, and other important events in your business.\n
    4. Quick Links: Provides shortcuts to frequently used pages and actions within the system.\n
    `,
    details: [
      {
        title: "Quick Links:",
        description: ` Provides shortcuts to frequently used pages and actions within the system. These links allow you to quickly navigate to important sections of the system, saving time and improving efficiency. \n
        The quick links are designed to be easily accessible and prominently displayed on the dashboard, allowing you to quickly access the pages and actions you use most frequently. \n
        The quick links can be customized to include the pages and actions that are most relevant to your business needs, allowing you to tailor the dashboard to your specific workflow. \n
        Overall, the quick links on the dashboard provide a convenient way to navigate the system and access important features quickly and efficiently. \n\n
          Below is a screenshot of the  quick links highlighted:
        `,

        images: [
          {
            src: "/helpImages/dashboard/quickLinks.png",
            alt: "Quick links screenshot",
          },
        ],
      },
      {
        title: "Recent Activity:",
        description: ` Shows the latest sales, stock movements, and other important events in your business. This section provides a real-time view of the most recent activities within the system, allowing you to stay up-to-date with the latest developments in your business. \n
        The recent activity section is designed to be easily accessible and prominently displayed on the dashboard, allowing you to quickly view the latest events and updates in your business. \n
        The recent activity section can be customized to display the types of events and activities that are most relevant to your business needs, allowing you to tailor the dashboard to your specific workflow. \n
        Overall, the recent activity section on the dashboard provides a convenient way to stay informed about the latest developments in your business and make informed decisions based on real-time data. \n\n
          Below is a screenshot of the  recent activity highlighted:
        `,

        images: [
          {
            src: "/helpImages/dashboard/recentActivity.png",
            alt: "Recent activity screenshot",
          },
        ],
      },
      {
        title: "KPIs (Key Performance Indicators):",
        description: `Displays total products, total sales, and inventory value. These metrics give you a quick overview of your business performance and help you make informed decisions.\n
          - Total Products: Shows the total number of products in your inventory.\n
          - Total Sales: Displays the total sales made within a specified period.\n
          - Inventory Value: Indicates the total value of your current inventory based on product costs and quantities.\n\n
          The KPIs are updated in real-time, allowing you to monitor your business performance and make informed decisions based on the latest data.\n\n

          Each KPI card has its own sparkline chart that shows the trend of that particular metric over time. This allows you to quickly identify patterns and trends in your business performance.\n
          The KPI cards are interactive, allowing you to click on them to view more detailed information and insights related to that specific metric. This helps you drill down into the data and gain a deeper understanding of your business performance.\n

          on the left-Bottom of each KPI card, there is a small badge that shows the percentage change compared to the previous period. This allows you to quickly assess whether your business performance is improving or declining over time. These values are calculated based on the historical data (last 30 days) against the current period.\n
          The KPI cards are designed to be visually appealing and easy to read, with clear labels and color-coded indicators that help you quickly identify important information at a glance.\n
          Overall, the KPIs on the dashboard provide a comprehensive overview of your business performance, allowing you to monitor key metrics and make informed decisions based on real-time data. \n\n\n

          Below is a screenshot of the dashboard page with the KPI cards highlighted:
        `,

        images: [
          {
            src: "/helpImages/dashboard/kpiCards.png",
            alt: "KPI cards screenshot",
          },
        ],
      },
      {
        title: "Graphs and Charts:",
        description:
          "Visual representations of sales trends, inventory levels, and other relevant data. These charts help you quickly identify patterns and trends in the business. Use them to spot strong periods, slowdowns, and unusual changes in stock movement.",

        subFeatures: [
          {
            text: `Sales Trend Chart:\n\n This chart shows the sales trend over time, allowing you to visualize how your sales are performing. You can see whether sales are increasing, decreasing, or remaining stable over a specific period. \n\n
            The chart provides a clear visual representation of your sales data, making it easier to identify trends and make informed decisions about your business strategy. \n\n
            The sales trend chart is interactive, allowing you to hover over data points to view specific values and details. This helps you gain a deeper understanding of your sales performance and identify areas for improvement. \n\n
            The chart can be customized to display different time periods, such as daily, weekly, or monthly trends, allowing you to analyze your sales data in a way that best suits your business needs. \n\n
            Overall, the sales trend chart is a valuable tool for monitoring your business performance and making data-driven decisions to improve your sales strategy.
              `,
            image: {
              src: "/helpImages/dashboard/salesTrend 1.png",
              alt: "Detailed sale graph illustration",
            },
          },
          {
            text: `Stock Loss Charts: \n\nThese charts provide insights into stock losses, helping you identify areas where inventory may be lost or wasted. By analyzing stock loss data, you can take proactive measures to reduce losses and improve your inventory management practices. \n
            The stock loss charts are designed to be visually appealing and easy to read, with clear labels and color-coded indicators that help you quickly identify important information at a glance. \n
            The charts can be customized to display different charts ie bar and pie charts, allowing you to analyze stock loss data easily and identify trends or patterns that may require attention. \n\n
            Overall, the stock loss charts are a valuable tool for monitoring your inventory performance and making data-driven decisions to improve your inventory management practices.
              `,
            image: {
              src: "/helpImages/dashboard/lossGraph 1.png",
              alt: "Stock loss chart illustration",
            },
          },
          {
            text: `Category Charts: \n\nThese charts provide insights into category performance, helping you identify which product categories are driving sales and which may need attention. By analyzing category data, you can make informed decisions about inventory allocation and marketing strategies. \n
            The category charts are designed to be visually appealing and easy to read, with clear labels and color-coded indicators that help you quickly identify important information at a glance. \n
            The charts can be customized to display different views ie bar and pie charts, allowing you to analyze category data easily and identify trends or patterns that may require attention. \n\n
            Overall, the category charts are a valuable tool for monitoring your inventory performance and making data-driven decisions to improve your inventory management practices.
              `,
            image: {
              src: "/helpImages/dashboard/categoryDistribution 1.png",
              alt: "Category chart illustration",
            },
          },
        ],
      },
    ],
  },
  {
    step: 2,
    title: "Product management",
    description: `Product management is a crucial aspect of any inventory system, and Quantis stock provides a comprehensive set of features to help you manage your products effectively. With Quantis stock, you can easily add new products, set reorder levels, and track inventory levels in real-time.\n\n
    The product management features in Quantis stock allow you to create detailed product profiles, including information such as SKU, category, price, and starting stock. You can also set reorder levels for each product, which helps you maintain optimal inventory levels and avoid stockouts.\n\n
    In addition to adding and managing products, Quantis stock provides real-time inventory tracking, allowing you to monitor stock levels and movements as they happen. This helps you make informed decisions about purchasing and restocking, ensuring that you always have the right products on hand to meet customer demand.\n\n

   Product Form  Fields are as explained below:\n
   - Product Name: The name of the product for easy identification.\n
   - SKU (Stock Keeping Unit): A unique identifier for the product, allowing you to track it easily.\n
    
    - Category: The category to which the product belongs, allowing you to organize your inventory efficiently.\n
    - Supplier: After you create a profile for a product supplier, the supplier information will be available for selection when creating product profiles and only one supplier can be selected at a time.\n
    - Unit Price: This is the price at which the product will be sold to customers.\n
    - Cost Price: This is the price at which the product was purchased from the supplier.\n
    - Unit: This is the unit of measurement for the product, such as pieces, kilograms, liters, etc.\n
    - Reorder Level: This is the minimum stock level at which you want to be alerted to reorder the product. When the stock level falls below this threshold, you will receive a notification to restock the product.\n\n

    How SKU (Stock Keeping Unit) works:\n
    The SKU is a unique identifier for each product in your inventory. It allows you to track products easily and efficiently, ensuring that you can quickly locate and manage them as needed. When creating a new product profile, you can either manually enter an SKU or allow the system to generate one automatically based on your preferred format.\n
    Example 1: If you have Laptops of different brands ie HP, DELL and ACER, You can use SKU format " LAP-001, LAP-002, LAP-003" for HP, DELL and ACER respectively. And if you have various colors of the same model, ie HP (black,White & silver), your SKU can be something like 'LAP-B-001' for black HP laptops, 'LAP-W-001 for white HP laptops etc...\n\n
    Example 2: If you have Shoes of kids, men and women, you can use SKU format SHO-001 for kids shoes, SHO-002 for men shoes, and  SHO-003 for female shoes, and if there are sports, gentle and casual types your SKUs can be something like 'SHO-S-001' for sports shoes for kids, 'SHO-G-001' for gentle shoes for kids and 'SHO-C-001' for casual shoes for kids. and for color ie black ,white shoes it will be SHO-GB-001 for gentle, black shoes for kids etc...\n\n

    How Category selection feild works:\n
    The category selection field allows you to assign each product to a specific category, helping you organize your inventory efficiently. When creating a new product profile, you can select the appropriate category from a dropdown list of predefined categories. This makes it easier to filter and search for products based on their category, streamlining your inventory management process.\n
    This feild will trigger and show different product specific feilds depending on the product category chosen at the bottom of the form in a section called 'Category-Specific Feilds'. If your category is not listed or if you need a fully customized category for  your product and  Category-Specific Feilds, select the 'other' option in the category dropdown selector. This will give you a new feild called  'custom category name' to create your own category name and  2 other feilds below the form in the 'Category-Specific Feilds' section ie 'title' and 'value', the title being the name of the specific field ie dimensions and value is for the field value  ie 3x4\n
    NOTE: For new 'Category-Specific Feilds' feilds when using the 'other' category option, click the 'Add Custom Feild' to add new empty feilds to create another product sepcification. \n\n

    Overall, the product management features in Quantis stock provide a powerful set of tools to help you manage your inventory effectively and efficiently.  `,
    details: [
      {
        title: "Creating a Product:",
        description: `To create a new product, navigate to the Products page and click on the "Add Product" button located at the most right-top corner og the page. This will display a form with all the necessary fields to create a new product. and when your done filling  the form, click save to save your inputs and create a new product profile.\n
          The product creation process is designed to be user-friendly and intuitive, allowing you to quickly add new products to your inventory without any hassle.\n\n
          Overall, the product creation feature in Quantis stock provides a simple and efficient way to manage your inventory and ensure that you always have the right products on hand to meet customer demand.`,
      },
      {
        title: "Product Card:",
        description: `After creating a product, you will see it displayed as a card in your inventory. The product card is a visual representation of each product in your inventory, providing key information at a glance. It includes details such as the product name, SKU, category, price, and current stock level. The product card also displays the reorder level, allowing you to quickly identify products that may need to be restocked. \n\n
          The product card is designed to be visually appealing and easy to read, with clear labels and color-coded indicators that help you quickly identify important information at a glance. The product card can be customized to display additional information, such as product images or descriptions, depending on your business needs. \n\n
          
          Product card features include:\n
          -Product Name: Displays the name of the product for easy identification.\n
          -SKU: Shows the unique identifier for the product, allowing you to track it easily.\n
          -Supplier: Indicates the supplier of the product, helping you manage your inventory effectively.\n
          -Category: Displays the category to which the product belongs, allowing you to organize your inventory efficiently.(category indicator is located in the left top corner of the product card)\n
          -Price: Displays the selling price of the product, allowing you to quickly assess its value.\n
          -Current Stock Level: Shows the quantity of the product currently in stock, helping you monitor inventory levels and avoid stockouts.(stock status indicator is located in the right top corner of the product card)\n

          The product card also provides quick access to key actions, such as;\n\n
            -Editing : This allows one to edit the profile of a selected profile.\n
            -Viewing : This allows one to view the profile of a selected profile in a product detail view and is represented by an 'eye' icon\n
            -Stocking In : This allows one to add stock to a particular product. Its represented by a ' + ' symbol\n
            -Deleting : This allows one to delete a particular product. Its represented by a ' trash' icon\n\n
           Overall, the product card is a valuable feature for summerizing key information about each product in your inventory, allowing you to manage your inventory effectively and take immedieate action when necessary. \n\n
          Below is a screenshot of the product card highlighted:
        `,
        images: [
          {
            src: "/helpImages/products/productCard.png",
            alt: "Product card screenshot",
          },
        ],
      },
      {
        title: "Product Details :",
        description: ` 
The product details view provides a comprehensive overview of each product in your inventory, allowing you to access key information and take action as needed. When you click on the 'Eye' icon of a particular product card, a details popup appears with the full  product information. \n\n
The product details view includes information such as;\n
             - Basic Information:This includes the SKU, category , reorder level, unit,  and status\n
             - Pricing Information: This includes the selling price and cost price of the product then the current stock\n
             - Supplier Information: This includes the supplier name and contact information\n
             - Custom Fields: This includes any custom fields that have been added to the product profile during creation\n
          \n\n
          The product details view also provides quick access to key actions, such as editing the product profile, adding stock, or deleting the product from your inventory. This allows you to take immediate action when necessary, helping you manage your inventory effectively and efficiently. \n\n
        `,
        images: [
          {
            src: "/helpImages/products/productDetails.png",
            alt: "Product details screenshot",
          },
        ],
      },
    ],
  },
  {
    step: 3,
    title: "Managing Inventory",
    description: "Track stock movements and levels",
    details: [
      {
        title: "Recording Stock Movements:",
        description: "• Record stock movements (in, out, or adjustments)",
        images: [
          { src: "/images/demo-step-3.jpg", alt: "Recording Stock Movements" },
        ],
      },
      {
        title: "Adding Movement Details:",
        description: "• Add reason for movement and reference number",
      },
      {
        title: "Viewing Stock History:",
        description: "• View complete stock history for each product",
      },
      {
        title: "Low Stock Alerts:",
        description: "• Get alerts when stock falls below reorder level",
      },
      {
        title: "Filtering Movements:",
        description: "• Filter movements by product to see history",
      },
    ],
  },
  {
    step: 4,
    title: "Creating a Sale",
    description: "Process customer sales and update stock",
    details: [
      "• Go to Sales page",
      '• Click "New Sale"',
      "• Select products and quantities from inventory",
      "• Add multiple items to create a complete sale",
      "• Review totals and complete the sale",
      "• Stock automatically updates after sale",
    ],
  },
  {
    step: 5,
    title: "Viewing Reports",
    description: "Analyze your business performance",
    details: [
      "• Access Inventory Report to see stock levels and values",
      "• View Sales Report for revenue and sales trends",
      "• Check Summary for overall business metrics",
      "• Export reports as CSV for further analysis",
      "• Identify top products and low stock items",
    ],
  },
  {
    step: 6,
    title: "Configuring Settings",
    description: "Customize the system for your business",
    details: [
      "• Set your company name and contact email",
      "• Choose currency and decimal format",
      "• Select measurement units (kg, L, units, etc.)",
      "• Enable/disable notifications (email, SMS, low stock)",
      "• Change your login credentials securely",
    ],
  },
];

export function DemoGuide() {
  return (
    <div className="space-y-4">
      <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
        <CardHeader>
          <CardTitle className="dark:text-teal-100">
            System Demo Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-6">
            Follow these steps to learn all the key features of Quantis stock.
            This guide covers everything from basic setup to advanced reporting.
          </p>

          <div className="space-y-4">
            {demoSteps.map((item) => (
              <div
                key={item.step}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 dark:bg-teal-600 text-white rounded-full shrink-0 font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400 text-sm mt-1 whitespace-pre-line">
                      {item.description}
                    </p>
                    <div className="mt-3 space-y-3">
                      {item.details.map((detail, idx) => {
                        const isObjectDetail =
                          typeof detail === "object" && detail !== null;
                        const title = isObjectDetail ? detail.title : undefined;
                        const description = isObjectDetail
                          ? detail.description
                          : detail;

                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 p-3"
                          >
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-teal-400 shrink-0 mt-0.5" />
                              <div>
                                {title ? (
                                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                    {title}
                                  </p>
                                ) : null}
                                <p className="text-sm text-gray-700 dark:text-slate-300 mt-1 whitespace-pre-line">
                                  {description}
                                </p>
                                {isObjectDetail && detail.images?.length ? (
                                  <div className="mt-3 space-y-2">
                                    {detail.images.map((image, imageIndex) => (
                                      <img
                                        key={`${title}-${imageIndex}`}
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full max-w-xl rounded-md border border-gray-200 dark:border-slate-700 object-cover"
                                      />
                                    ))}
                                  </div>
                                ) : null}
                                {isObjectDetail &&
                                detail.subFeatures?.length ? (
                                  <div className="mt-4 space-y-3">
                                    {detail.subFeatures.map(
                                      (subFeature, subIndex) => (
                                        <div
                                          key={`${title}-sub-${subIndex}`}
                                          className="rounded-md border border-gray-100 bg-gray-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/50"
                                        >
                                          <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-line">
                                            {subFeature.text}
                                          </p>
                                          {subFeature.image ? (
                                            <img
                                              src={subFeature.image.src}
                                              alt={subFeature.image.alt}
                                              className="mt-3 w-full max-w-xl rounded-md border border-gray-200 dark:border-slate-700 object-cover"
                                            />
                                          ) : null}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

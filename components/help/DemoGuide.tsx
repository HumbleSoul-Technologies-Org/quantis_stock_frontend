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
    The dashboard is designed to give you a snapshot of your business at a glance, allowing you to monitor sales, stock levels, and other important data without having to navigate through multiple pages.\n\n

    Sections of the dashboard include:\n
    1. KPIs (Key Performance Indicators): Displays total products, total sales, and stock value.\n
    2. Graphs and Charts: Visual representations of sales trends, stock levels, and other relevant data.\n
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
        description: `Displays total products, total sales, and stock value. These metrics give you a quick overview of your business performance and help you make informed decisions.\n
          - Total Products: Shows the total number of products in your stock.\n
          - Total Sales: Displays the total sales made within a specified period.\n
          - Stock Value: Indicates the total value of your current stock based on product costs and quantities.\n\n
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
          "Visual representations of sales trends, stock levels, and other relevant data. These charts help you quickly identify patterns and trends in the business. Use them to spot strong periods, slowdowns, and unusual changes in stock movement.",

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
            text: `Stock Loss Charts: \n\nThese charts provide insights into stock losses, helping you identify areas where stock may be lost or wasted. By analyzing stock loss data, you can take proactive measures to reduce losses and improve your stock management practices. \n
            The stock loss charts are designed to be visually appealing and easy to read, with clear labels and color-coded indicators that help you quickly identify important information at a glance. \n
            The charts can be customized to display different charts ie bar and pie charts, allowing you to analyze stock loss data easily and identify trends or patterns that may require attention. \n\n
            Overall, the stock loss charts are a valuable tool for monitoring your stock performance and making data-driven decisions to improve your stock management practices.
              `,
            image: {
              src: "/helpImages/dashboard/lossGraph 1.png",
              alt: "Stock loss chart illustration",
            },
          },
          {
            text: `Category Charts: \n\nThese charts provide insights into category performance, helping you identify which product categories are driving sales and which may need attention. By analyzing category data, you can make informed decisions about stock allocation and marketing strategies. \n
            The category charts are designed to be visually appealing and easy to read, with clear labels and color-coded indicators that help you quickly identify important information at a glance. \n
            The charts can be customized to display different views ie bar and pie charts, allowing you to analyze category data easily and identify trends or patterns that may require attention. \n\n
            Overall, the category charts are a valuable tool for monitoring your stock performance and making data-driven decisions to improve your stock management practices.
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
    description: `Product management is a crucial aspect of any stock system, and Quantis stock provides a comprehensive set of features to help you manage your products effectively. With Quantis stock, you can easily add new products, set reorder levels, and track stock levels in real-time.\n\n
    The product management features in Quantis stock allow you to create detailed product profiles, including information such as SKU, category, price, and starting stock. You can also set reorder levels for each product, which helps you maintain optimal stock levels and avoid stockouts.\n\n
    In addition to adding and managing products, Quantis stock provides real-time stock tracking, allowing you to monitor stock levels and movements as they happen. This helps you make informed decisions about purchasing and restocking, ensuring that you always have the right products on hand to meet customer demand.\n\n

   Product Form  Fields are as explained below:\n
   - Product Name: The name of the product for easy identification.\n
   - SKU (Stock Keeping Unit): A unique identifier for the product, allowing you to track it easily.\n
    
    - Category: The category to which the product belongs, allowing you to organize your stock efficiently.\n
    - Supplier: After you create a profile for a product supplier, the supplier information will be available for selection when creating product profiles and only one supplier can be selected at a time.\n
    - Unit Price: This is the price at which the product will be sold to customers.\n
    - Cost Price: This is the price at which the product was purchased from the supplier.\n
    - Unit: This is the unit of measurement for the product, such as pieces, kilograms, liters, etc.\n
    - Reorder Level: This is the minimum stock level at which you want to be alerted to reorder the product. When the stock level falls below this threshold, you will receive a notification to restock the product.\n\n

    How SKU (Stock Keeping Unit) works:\n
    The SKU is a unique identifier for each product in your stock. It allows you to track products easily and efficiently, ensuring that you can quickly locate and manage them as needed. When creating a new product profile, you can either manually enter an SKU or allow the system to generate one automatically based on your preferred format.\n
    Example 1: If you have Laptops of different brands ie HP, DELL and ACER, You can use SKU format " LAP-001, LAP-002, LAP-003" for HP, DELL and ACER respectively. And if you have various colors of the same model, ie HP (black,White & silver), your SKU can be something like 'LAP-B-001' for black HP laptops, 'LAP-W-001 for white HP laptops etc...\n\n
    Example 2: If you have Shoes of kids, men and women, you can use SKU format SHO-001 for kids shoes, SHO-002 for men shoes, and  SHO-003 for female shoes, and if there are sports, gentle and casual types your SKUs can be something like 'SHO-S-001' for sports shoes for kids, 'SHO-G-001' for gentle shoes for kids and 'SHO-C-001' for casual shoes for kids. and for color ie black ,white shoes it will be SHO-GB-001 for gentle, black shoes for kids etc...\n\n

    How Category selection feild works:\n
    The category selection field allows you to assign each product to a specific category, helping you organize your stock efficiently. When creating a new product profile, you can select the appropriate category from a dropdown list of predefined categories. This makes it easier to filter and search for products based on their category, streamlining your stock management process.\n
    This feild will trigger and show different product specific feilds depending on the product category chosen at the bottom of the form in a section called 'Category-Specific Feilds'. If your category is not listed or if you need a fully customized category for  your product and  Category-Specific Feilds, select the 'other' option in the category dropdown selector. This will give you a new feild called  'custom category name' to create your own category name and  2 other feilds below the form in the 'Category-Specific Feilds' section ie 'title' and 'value', the title being the name of the specific field ie dimensions and value is for the field value  ie 3x4\n
    NOTE: For new 'Category-Specific Feilds' feilds when using the 'other' category option, click the 'Add Custom Feild' to add new empty feilds to create another product sepcification. \n\n

    Overall, the product management features in Quantis stock provide a powerful set of tools to help you manage your stock effectively and efficiently.  `,
    details: [
      {
        title: "Creating a Product:",
        description: `To create a new product, navigate to the Products page and click on the "Add Product" button located at the most right-top corner og the page. This will display a form with all the necessary fields to create a new product. and when your done filling  the form, click save to save your inputs and create a new product profile.\n
          The product creation process is designed to be user-friendly and intuitive, allowing you to quickly add new products to your stock without any hassle.\n\n
          Overall, the product creation feature in Quantis stock provides a simple and efficient way to manage your stock and ensure that you always have the right products on hand to meet customer demand.`,
      },
      {
        title: "Product Card:",
        description: `After creating a product, you will see it displayed as a card in your stock. The product card is a visual representation of each product in your stock, providing key information at a glance. It includes details such as the product name, SKU, category, price, and current stock level. The product card also displays the reorder level, allowing you to quickly identify products that may need to be restocked. \n\n
          The product card is designed to be visually appealing and easy to read, with clear labels and color-coded indicators that help you quickly identify important information at a glance. The product card can be customized to display additional information, such as product images or descriptions, depending on your business needs. \n\n
          
          Product card features include:\n
          -Product Name: Displays the name of the product for easy identification.\n
          -SKU: Shows the unique identifier for the product, allowing you to track it easily.\n
          -Supplier: Indicates the supplier of the product, helping you manage your stock effectively.\n
          -Category: Displays the category to which the product belongs, allowing you to organize your stock efficiently.(category indicator is located in the left top corner of the product card)\n
          -Price: Displays the selling price of the product, allowing you to quickly assess its value.\n
          -Current Stock Level: Shows the quantity of the product currently in stock, helping you monitor stock levels and avoid stockouts.(stock status indicator is located in the right top corner of the product card)\n

          The product card also provides quick access to key actions, such as;\n\n
            -Editing : This allows one to edit the profile of a selected profile.\n
            -Viewing : This allows one to view the profile of a selected profile in a product detail view and is represented by an 'eye' icon\n
            -Stocking In : This allows one to add stock to a particular product. Its represented by a ' + ' symbol\n
            -Deleting : This allows one to delete a particular product. Its represented by a ' trash' icon\n\n
           Overall, the product card is a valuable feature for summerizing key information about each product in your stock, allowing you to manage your stock effectively and take immedieate action when necessary. \n\n
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
The product details view provides a comprehensive overview of each product in your stock, allowing you to access key information and take action as needed. When you click on the 'Eye' icon of a particular product card, a details popup appears with the full  product information. \n\n
The product details view includes information such as;\n
             - Basic Information:This includes the SKU, category , reorder level, unit,  and status\n
             - Pricing Information: This includes the selling price and cost price of the product then the current stock\n
             - Supplier Information: This includes the supplier name and contact information\n
             - Custom Fields: This includes any custom fields that have been added to the product profile during creation\n
          \n\n
          The product details view also provides quick access to key actions, such as editing the product profile, adding stock, or deleting the product from your stock. This allows you to take immediate action when necessary, helping you manage your stock effectively and efficiently. \n\n
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
    title: "Stock Management",
    description: `Quantis stock provides a comprehensive set of features to help you manage your stock effectively. With Quantis stock, you can easily record stock movements, add movement details, view stock history, receive low stock alerts, and filter movements by product.\n\n
    The stock management features in Quantis stock allow you to maintain accurate stock records, ensuring that you always have the right products on hand to meet customer demand. You can record stock movements for incoming and outgoing products, as well as adjustments for damaged or lost items. This helps you keep track of your stock levels and avoid stockouts or overstocking.\n\n
    In addition to recording stock movements, Quantis stock provides detailed movement information, allowing you to add reasons for movements and reference numbers for easy tracking. You can also view the complete stock history for each product, giving you insights into past movements and trends.\n\n
    The system also provides low stock alerts, notifying you when stock levels fall below the reorder level. This helps you take proactive measures to restock products before they run out, ensuring that you can meet customer demand and avoid lost sales.\n\n

    The Stock Page is comprised of various sections as listed below:\n
    1. Stock Movement Form: This form allows you to record stock movements for incoming and outgoing products, as well as adjustments for damaged or lost items. You can select the product, enter the quantity, and provide any additional details such as the reason for the movement and reference number.\n
    2. Stock History Table: This table displays the complete stock history for each product, including details such as the date of the movement, the type of movement (in or out), the quantity moved, and any additional notes or references.\n
    3. Low Stock Alerts: This section provides notifications when stock levels fall below the reorder level, allowing you to take proactive measures to restock products before they run out.\n
    4. Filtering Options: This section allows you to filter stock movements by product, date range, or movement type, making it easy to find specific information and analyze trends in your stock management.\n
    5. KPIs (Key Performance Indicators): Displays total stock movements, total stock in, and total stock out. These metrics give you a quick overview of your stock management performance and help you make informed decisions.\n
    6. Product Cards: Displays all products in the stock with their current stock levels, reorder levels, and other relevant information. This allows you to quickly assess the status of your stock and identify products that may need attention.\n\n
    Overall, the stock management features in Quantis stock provide a powerful set of tools to help you manage your stock effectively and efficiently, ensuring that you always have the right products on hand to meet customer demand.`,
    details: [
      {
        title: "Stocking In and Out:",
        description: `Stoking in and out is a crucial aspect of stock management, and Quantis stock provides a simple and efficient way to record stock movements. With Quantis stock, you can easily add new stock to your stock or remove stock when products are sold or used.\n
        This can however be done in 2 ways, either by clicking the 'Stock In' button on the top right corner of the stock page or by clicking the ' + ' icon on a particular product card in the products page. \n
        When you click on the 'Stock In' button, a form will appear where you can select the product, enter the quantity, and provide any additional details such as the reason for the movement and reference number. Once you submit the form, the stock levels will be updated in real-time, ensuring that your stock records are always accurate and up-to-date.\n\n
        
        Stock Movement form feilds;\n
        - Product: Select the product for which you want to record the stock movement.\n
        - Quantity: Enter the quantity of the product being added or removed from stock.(This must be greater than the amount of reorder level set in the product profile)\n
        -Movement Type: Choose whether the stock is being added (Stock In) or removed (Stock Out) from stock. The reason feild will dynamically update based on the selected movement type ie 'Stock in' will show diffedrent reasons and 'Stock out' will show different reasons.\n
        - Reason for Movement: Provide a reason for the stock movement, such as "New Stock Arrival" or "Damage".\n
        - Reference Number: Enter a reference number for easy tracking and record-keeping.(Its auto generated)\n\n

        NOTE: Trying to create a stock movement via the ' + ' icon on a product card will automatically select the product and open the stock movement form with the selected product already filled in the product feild. \n\n
        Overall, the stock movement feature in Quantis stock provides a simple and efficient way to manage your stock, ensuring that you always have accurate records of your stock levels and movements. \n
        `,
        images: [
          {
            src: "/helpImages/stock/form.png",
            alt: "Recording Stock Movements",
          },
        ],
      },
      {
        title: "KPIs (Key Performance Indicators) Section:",
        description: `This section is located at the top of the stock page and displays the Restocks made in the laast 30 days, Restocks Needed,  Stock Outs, and total stock storage. These metrics give you a quick overview of your stock management performance and help you make informed decisions.\n
        - Restocks made in the laast 30 days: This card shows the number of restocks made in the last 30 days.\n
        - Restocks Needed: Displays the total quantity of products added to stock through stock in transactions.\n
        - Stock Out: Indicates the total quantity of products removed from stock through stock out transactions.\n
        - Total Stock Storage: Shows the total quantity of products currently in stock.\n\n
        `,
        images: [
          {
            src: "/helpImages/stock/kpi.png",
            alt: "Stock KPIs screenshot",
          },
        ],
      },
      {
        title: "Filtering Stock Movements:",
        description: `This feature allows you to filter stock movements by product, date range, or movement type, making it easy to find specific information and analyze trends in your stock management. \n
        The filtering options are located at the top of the stock history table, allowing you to quickly and easily filter the data based on your specific needs. You can select a product from the dropdown list, choose a date range, and select the movement type (in or out) to narrow down the results.\n
        Once you apply the filters, the stock history table will update in real-time to display only the relevant data, making it easy to analyze trends and identify areas for improvement in your stock management practices.\n


        You can filter by product category, stock level status and by searching by product name or SKU. This allows you to quickly find specific products and assess their stock levels, making it easier to manage your stock effectively.
        
        \n`,
        images: [
          {
            src: "/helpImages/stock/filters.png",
            alt: "Stock filtering screenshot",
          },
        ],
      },
      {
        title: "Products Section:",
        description: `The Products section allows you to manage your product catalog, including adding new products, updating existing ones, and viewing detailed information about each item. \n
        When a product profile is created, it will appear in this section on a card format, displaying key information such as the product name, SKU, category, price, and current stock level. It even has a progress bar that shows the stock level visually.\n
        The Products section is designed to be user-friendly and intuitive, allowing you to quickly and easily manage your product catalog without any hassle. You can also use the search and filtering options to find specific products or categories, making it easy to navigate your stock and keep track of your stock levels.\n\n
        Overall, the Products section in Quantis stock provides a simple and efficient way to manage your product catalog, ensuring that you always have accurate records of your stock and can make informed decisions about your business operations. \n\n

        Below is a screenshot of the products section highlighted:
        `,
        images: [
          {
            src: "/helpImages/stock/productCards.png",
            alt: "Products section screenshot",
          },
        ],
      },
      {
        title: "Stock History Table:",
        description: `The Stock History Table displays the complete stock history for each product, including details such as the date of the movement, the type of movement (in or out), the quantity moved, and any additional notes or references. \n
        The table is designed to be user-friendly and easy to read, with clear labels and color-coded indicators that help you quickly identify important information at a glance. You can sort the table by date, product name, or movement type, making it easy to find specific information and analyze trends in your stock management practices.\n
        The Stock History Table is updated in real-time, ensuring that you always have accurate records of your stock movements and can make informed decisions about your business operations. \n\n
        Overall, the Stock History Table in Quantis stock provides a comprehensive overview of your stock management practices, allowing you to monitor stock movements and make data-driven decisions to improve your business performance. \n\n
        
        Below is a screenshot of the stock history table highlighted:
        `,
        images: [
          {
            src: "/helpImages/stock/history.png",
            alt: "Stock History Table screenshot",
          },
        ],
      },
    ],
  },
  {
    step: 4,
    title: "Sales Management",
    description: ` Quiantis stock provides a comprehensive set of features to help you manage your sales effectively. With Quantis stock, you can easily create new sales, add multiple items to a sale, review totals, and complete the sale. The system automatically updates stock levels after each sale, ensuring that your records are always accurate and up-to-date.\n\n
    The sales management features in Quantis stock allow you to maintain accurate sales records, ensuring that you can track revenue and analyze sales trends over time. You can create new sales by selecting products and quantities from your stock, adding multiple items to create a complete sale. The system calculates totals automatically, allowing you to review the sale before completing it.\n\n
    In addition to creating new sales, Quantis stock provides detailed sales reports, allowing you to analyze revenue and sales trends over time. You can view summary reports for overall business metrics, as well as detailed reports for individual products or categories. This helps you make informed decisions about pricing, promotions, and inventory management.\n\n

    Furthermore, in relation to sales Quintos stocks allows you to return products to stock in case of a customer return. This feature allows you to manage returns efficiently and ensure that your stock records are always accurate and up-to-date. You can easily process returns by selecting the product, entering the quantity being returned, and providing any additional details such as the reason for the return and reference number.\n\n

    For advanced tires, sales  can be taken on credit and the system will automatically generate a customer invoice for the sale. This feature allows you to manage credit sales efficiently and ensure that your records are always accurate and up-to-date. You can easily process credit sales by selecting the customer, entering the sale details, and generating an invoice for the transaction.\n\n

    How sales returns work:\n
    The sales return feature allows you to manage customer returns efficiently and ensure that your stock records are always accurate and up-to-date. When a customer returns a product, you can easily process the return by selecting the product, entering the quantity being returned, and providing any additional details such as the reason for the return and reference number. The system will automatically update stock levels and sales records accordingly, ensuring that your business operations run smoothly.\n\n
     Steps to process a sales return:\n
    1. Go to the Sales page and locate the sale for which you want to process a return (sales history table).\n
    2. Click on the sale for it to expand, then click the  "Return" button next to the "Edit" button to open the return form.\n
    3. The  return form has various sections ie Return Items(sold item names, return quqntity feild, and total amount of expceted return payment), Return Details (reason for return, refund  amount, refund method for the method your planning to refund the customer, additional notes), and Return Summary (total amount to be refunded to the customer).\n 
    4. Fill in the return form and then click the 'Process Return button to submit the sales return\n
   
    What this will do:\n
    - The system will automatically update the stock levels for the returned products, adding them back to your stock.\n
    - The sales records will be updated to reflect the return, ensuring that your revenue and sales data remain accurate.\n
    - You can generate a return receipt for the customer, providing them with documentation of the return transaction.\n\n

    Other features:\n
     1. Reciept Download: After a sucessfull sale, you can download the reciept as pdf and print it out.
     2. Bulk Reciept Download: This enables you to download all sales reciepts as pdf
     3. Data export: This enebles you to export the sales data in csv format fo external use.


    Overall, the sales management features in Quantis stock provide a powerful set of tools to help you manage your sales effectively and efficiently, ensuring that you can track revenue and analyze sales trends to improve your business performance and be;low are various sections in the sales page explained in detail:`,
    details: [
      {
        title: "Creating a Sale:",
        description: `
        To create a sale, head to the 'Sales page' , there you will find a sales form alongside a reciept preview. The sale can be made i 2 ways ie;
         1. Normal sale - sale with immediet pay
         2. Credit Sale- sale made on credit(for wholesalers and manufacturers only).

         Normal Sale Steps:
          - Fill the customer name
          - Select your payment type
          - Add a product by firts selecting a product, enter the quantity and then click add to add a product item to the sales queue.( You can add more than one product if needed)
          - Enter a few notes in the notes feild ie describing the products being sold in detail if possible.
          - Then click 'Complete Sale' to complete the sale and generate a reciept for the customer. The reciept can be downloaded as pdf and printed out for the customer.

          Credit Sale Steps:
           - Fill the customer name (This can also be prefilled if a customer profile has been selected from the customer dropdown list)
           - Check the record as credit sale checkbox. This will display new feilds  ie credit customer, Due date  and transaction ID.
           - Selected a customer making the sale on credit from the credit customer dropdown list. (NOTE: The customer must have a profile created in the system to be selected from the dropdown list)
           - Then select a due date for the credit sale. This is the date by which the customer is expected to make payment for the sale.
           - Feilds reciept reference and transaction ID are auto generated and cannot be edited.
           - Add a product by firts selecting a product, enter the quantity and then click add to add a product item to the sales queue.( You can add more than one product if needed)
           - Enter a few notes in the notes feild ie describing the products being sold in detail if possible.

      After a sucessfull payment, the reciept preview will be filled with the sale details and camn be downloaded as pdf and printed out for the customer by clicking the 'Download Reciept' button. You can also download all sales reciepts as pdf by clicking the 'Download All Reciepts' button on the top right corner of the sales page. You can also export the sales data in csv format for external use by clicking the 'Export Data' button on the top right corner of the sales page.
         
         `,
        images: [
          {
            src: "/helpImages/sales/sales.png",
            alt: "Credit Sale Process",
          },
        ],
      },
      {
        title: "Sales KPI section:",
        description: `
        The sales KPI section provides a comprehensive overview of your sales performance, allowing you to track key metrics and identify trends in your business operations. \n
        This section displays important indicators such as total sales, average transaction value, and customer acquisition rates, helping you make informed decisions about your sales strategies. \n
        You can customize the KPIs displayed to focus on the metrics that are most relevant to your business goals. \n\n
        Overall, the sales KPI section in Quantis stock provides a powerful tool for monitoring and improving your sales performance.
        `,
        images: [
          {
            src: "/helpImages/sales/kpi.png",
            alt: "Sales KPI screenshot",
          },
        ],
      },
      {
        title: "Sales History section:",
        description: `
        The sales history section provides a detailed record of all your sales transactions, allowing you to review past sales and analyze customer purchasing behavior. \n
        This section displays important information such as the date of each sale, the customer involved, the products sold, and the total amount of each transaction. \n
        
        To see more details about a sale, click on the sale to expand it and view additional information such as payment method, transaction ID, and any notes associated with the sale. \n
        You can also filter the sales history by date range, customer, or product, making it easy to find specific transactions and analyze trends in your sales data. \n\n
        Overall, the sales history section in Quantis stock provides a valuable resource for tracking and analyzing your sales performance over time.
        `,
        images: [
          {
            src: "/helpImages/sales/history.png",
            alt: "Sales History screenshot",
          },
        ],
      },
    ],
  },
  {
    step: 5,
    title: "Supplier Management",
    description: `
    Supplier management is a crucial aspect of any stock system, and Quantis stock provides a comprehensive set of features to help you manage your suppliers effectively. With Quantis stock, you can easily add new suppliers, view supplier details, and track supplier performance.\n
    The supplier management features in Quantis stock allow you to create detailed supplier profiles, including information such as company name, contact person, email, phone number, and address. You can also view a list of all suppliers in your system, making it easy to manage your supplier relationships and ensure that you have the right products on hand to meet customer demand.\n


     
    Overall, the supplier management features in Quantis stock provide a powerful set of tools to help you manage your suppliers effectively and efficiently.
    `,
    details: [
      {
        title: "Creating a Supplier:",
        description: ` 
        To create a new supplier, navigate to the Suppliers page and click on the "Add Supplier" button located at the top right corner of the page. This will display a form with all the necessary fields to create a new supplier profile. Fill in the required information and click save to create the supplier profile.\n
        The supplier creation process is designed to be user-friendly and intuitive, allowing you to quickly add new suppliers to your system without any hassle. Once a supplier profile is created, you can view the supplier details by clicking on the supplier name in the list of suppliers. This will display a detailed view of the supplier profile, including all the information you entered during creation.\n\n

        NOTE: You cannot create a product profile without first creating a supplier profile. This is because each product must be associated with a supplier, and the system requires that you have at least one supplier in your system before you can create a product profile.\n\n
        Overall, the supplier management features in Quantis stock provide a simple and efficient way to manage your suppliers, ensuring that you always have accurate records of your supplier relationships and can make informed decisions about your business operations.
        `,
        images: [
          {
            src: "/helpImages/suppliers/form.png",
            alt: "Creating a Supplier screenshot",
          },
        ],
      },
      {
        title: "Viewing Supplier Details:",
        description: ` 
        To view the details of a supplier, navigate to the Suppliers page and click on the eye icon in the list of suppliers. This will display a detailed view of the supplier profile, including all the information you entered during creation.\n\n
        `,
        images: [
          {
            src: "/helpImages/suppliers/details.png",
            alt: "Viewing Supplier Details screenshot",
          },
        ],
      },
      {
        title: "Supplier Tables:",
        description: ` 
        The supplier tables provide a comprehensive overview of all your suppliers, allowing you to view and manage your supplier relationships effectively. The tables display important information such as the supplier name, contact person, email, phone number, and address. At the extrem end of each row in the table, you will find action buttons that allow you to view, edit, or delete a supplier profile. \n
        `,
        images: [
          {
            src: "/helpImages/suppliers/table.png",
            alt: "Supplier Tables screenshot",
          },
        ],
      },
    ],
  },
  {
    step: 6,
    title: "Customer Management",
    description: `Customer management is a crucial aspect of any stock system, and Quantis stock provides a comprehensive set of features to help you manage your customers effectively. With Quantis stock, you can easily add new customers, view customer details, and track customer performance.\n

    The main purpose of this feature is to make it possible to make sales on credit to customers and also to keep track of the customers who have made purchases from your business. With Quantis stock, you can create detailed customer profiles, including information such as company name, contact person, email, phone number, and address. You can also view a list of all customers in your system, making it easy to manage your customer relationships and ensure that you have the right products on hand to meet customer demand.\n

    The customer management feature has subfeatures ie;
     - Creating Customer Profiles: This feature allows you to create detailed customer profiles, including information such as company name, contact person, email, phone number, and address. You can also view a list of all customers in your system, making it easy to manage your customer relationships and ensure that you have the right products on hand to meet customer demand.\n
     - Making Payments of Credit Sales: This feature allows you to manage credit sales efficiently and ensure that your records are always accurate and up-to-date. You can easily process credit sales by selecting the customer, entering the sale details, and generating an invoice for the transaction. You can also record payments made by customers for credit sales, ensuring that your records are always accurate and up-to-date.\n


    `,
    details: [
      {
        title: "Creating a Customer Profile:",
        description: ` 
        Navigate to the Customers page and click on the "Add Customer" button located at the top right corner of the page. This will display a form with all the necessary fields to create a new customer profile. Fill in the required information and click save to create the customer profile.\n
        The customer creation process is designed to be user-friendly and intuitive, allowing you to quickly add new customers to your system without any hassle. Once a customer profile is created, you can view the customer details by clicking on the customer name in the list of customers. This will display a detailed view of the customer profile, including all the information you entered during creation.\n\n

        `,
        images: [
          {
            src: "/helpImages/customers/form.png",
            alt: "Creating a Customer screenshot",
          },
        ],
      },
      {
        title: "Viewing Customer Details:",
        description: ` 
       To view the customer details, each customer profile in the table has a 3 dot menue at the right end of the row. Click on the 3 dot menue and select 'View Details' to view the customer details. This will display a detailed view of the customer profile, including all the information you entered during creation.\n

        `,
        images: [
          {
            src: "/helpImages/customers/details.png",
            alt: "Viewing Customer Details screenshot",
          },
        ],
      },
    ],
  },

  {
    step: 7,
    title: "Branch Management",
    description: `
    Branch management is a crucial aspect of any stock system, and Quantis stock provides a comprehensive set of features to help you manage your branches effectively. With Quantis stock, you can easily add new branches, view branch details, and track branch performance.\n

    This feature allows you to create detailed branch profiles, including information such as branch name, contact person, email, phone number, and address. You can also view a list of all branches in your system, making it easy to manage your branch relationships and ensure that you have the right products on hand to meet customer demand.\n

    This feature is particularly useful for businesses with multiple locations, as it allows you to manage your stock and sales across all branches from a single platform. You can easily transfer stock between branches, track sales performance by branch, and generate reports to analyze branch performance over time.\n

    Branches are managed in the branches page. This page has various sections ie map section for showing various branch locations on the map, Table section for showing all the branches in a table format, and a form section for creating new branch profiles. The table section displays important information such as the branch name, contact person, email, phone number, and address. At the extrem end of each row in the table, you will find action buttons that allow you to  edit, or delete a branch profile. \n
    To view a branch profile, click on the branch in the table row in the list of branches. This will display a detailed view of the branch profile, including all the information you entered during creation.\n
    `,
    details: [
      {
        title: "Creating a Branch Profile:",
        description: ` 
        Navigate to the Branches page and click on the "Add Branch" button located at the top right corner of the page. This will display a form with all the necessary fields to create a new branch profile. Fill in the required information and click save to create the branch profile.\n
        The branch creation process is designed to be user-friendly and intuitive, allowing you to quickly add new branches to your system without any hassle. Once a branch profile is created, you can view the branch details by clicking on the branch  in the list of branches. This will display a detailed view of the branch profile, including all the information you entered during creation.\n\n`,
        images: [
          {
            src: "/helpImages/branches/form.png",
            alt: "Creating a Branch screenshot",
          },
        ],
      },
      {
        title: "Viewing Branch Details:",
        description: ` 
        To view branch details, click on the individual branch in the table row in the list of branches. This will display a detailed view of the branch profile, including all the information you entered during creation.\n\n
        This page has as described below;\n
        - Overview Section: This section provides a summary of the branch profile, including the branch name, contact person, email, phone number, and address.\n
        - Sales Section: This section displays the sales performance of a particular branch, allowing you to track revenue and analyze sales trends over time.\n
        - Stock Movements Section: This section displays the stock movements for a particular branch, allowing you to track stock levels and analyze trends in your stock management practices.\n
        - Users Section: This section displays the users associated with a particular branch, allowing you to manage user access and permissions for each branch.\n
        

        `,
        images: [
          {
            src: "/helpImages/branches/overview.png",
            alt: "Viewing Branch Details screenshot",
          },
        ],
      },
    ],
  },
  {
    step: 8,
    title: "Settings Management",
    description: `
    Settings management is a crucial aspect of any stock system, and Quantis stock provides a comprehensive set of features to help you manage your settings effectively. With Quantis stock, you can easily customize your system settings, including company information, tax rates, and other important parameters.\n
0
    In the settings page, you can set the settings;
     - Company Information: This feature allows you to set your company information, including company name, address, phone number, and email. This information is used throughout the system, including in invoices and reports.\n
     - Currency Settings: This feature allows you to set your preferred currency for transactions and reports. You can choose from a list of supported currencies, ensuring that your financial data is accurate and consistent.\n
     - Users Management: This feature allows you to manage user access and permissions for your system. You can create new user accounts, assign roles and permissions, and monitor user activity to ensure that your system is secure and compliant with your business policies.\n
     - Security Settings: This feature allows you to configure security settings for your system, including password policies, two-factor authentication, and other security measures. You can ensure that your system is protected against unauthorized access and data breaches.\n
    `,
    details: [
      {
        title: "Company Profile:",
        description: ` 
        Company profile is a crucial aspect of any stock system, and Quantis stock provides a comprehensive set of features to help you manage your company profile effectively. With Quantis stock, you can easily customize your company information, including company name, address, phone number, and email.\n
        The company profile information is used throughout the system, including in invoices and reports. You can ensure that your company information is accurate and up-to-date, providing a professional image to your customers and stakeholders.\n

        `,
        images: [
          {
            src: "/helpImages/settings/profile.png",
            alt: "Viewing Company Profile screenshot",
          },
        ],
      },
      {
        title: "Currency Settings:",
        description: ` 
        Currency settings are a crucial aspect of any stock system, and Quantis stock provides a comprehensive set of features to help you manage your currency settings effectively. With Quantis stock, you can easily customize your preferred currency for transactions and reports.\n
        You can choose from a list of supported currencies, ensuring that your financial data is accurate and consistent. This feature allows you to manage your financial data effectively, providing a clear overview of your business performance and enabling you to make informed decisions about your operations.\n

        `,
        images: [
          {
            src: "/helpImages/settings/currency.png",
            alt: "Viewing Currency Settings screenshot",
          },
        ],
      },
      {
        title: "User Management:",
        description: ` 
        User management is a critical component of any stock system, and Quantis stock provides a comprehensive set of features to help you manage your users effectively. With Quantis stock, you can easily create, update, and delete user accounts, as well as assign roles and permissions.\n
        You can also view user activity logs and track user behavior to ensure compliance and security.\n
         
        NOTE: Only the admin user can manage users in the system. The admin user has full access to all features and settings, while other users may have limited access based on their assigned roles and permissions.\n

        There a various roles for various users in the system ie;
         - Sales : This role is designed for users who are responsible for managing sales transactions and customer interactions. Sales users can create new sales, view sales history, and manage customer profiles. They may also have access to certain reporting features to track sales performance and revenue trends.\n
         - Manager: This role is designed for users who are responsible for overseeing the overall operations of the stock system at a branch level. Managers have access to a wide range of features, including sales management, stock management, and reporting. They can also manage user accounts and permissions, ensuring that the right people have access to the right information.\n
         For multiple branches, a user with the manager role can only manage the branch they are assigned to. They cannot access or manage other branches in the system.\n
         - Admin: This role is designed for users who are responsible for managing the overall operations of the stock system at a company level. Admin users have full access to all features and settings, including user management, branch management, and reporting. They can also manage system settings and configurations, ensuring that the system is optimized for their business needs.\n

         Access Rights for each User Role:\n
          1. Sales:
              - Action: Creating a Sale, Viewing Sales History, View Products, Managing Customer Profiles,Viewing graphs in the dashboard, Using the quick action section, Viewing amount of stock of a product.\n
              - Pages: Dashboard, Sales, Customers, Stock, Products,\n

          2. Manager:
              - Action: Creating a Sale, Viewing Sales History, View Products, Managing Customer Profiles, Using the quick action section, Viewing amount of stock of a product, Managing Stock Movements, Managing Suppliers, Managing Branches, Managing user profiles\n
              - Pages: Dashboard, Sales, Customers, Stock, Products, Suppliers, Branches\n
          3. Admin:
              - Action: Creating a Sale, Viewing Sales History, View Products, Managing Customer Profiles, Viewing graphs in the dashboard, Viewing amount of stock of a product, Managing Stock Movements, Managing Suppliers, Managing Branches, Managing user profiles, Managing System Settings\n
              - Pages: Dashboard, Sales, Customers, Stock, Products, Suppliers, Branches, Settings\n

        `,
        images: [
          {
            src: "/helpImages/settings/users.png",
            alt: "Viewing User Management screenshot",
          },
        ],
      },
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

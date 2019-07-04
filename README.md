# Extension taoReview

Extension for reviewing passed tests, with the display of actual and correct answers, as well as the number of points for each answer.

### Usage

Run `composer require "oat-sa/extension-tao-review"` for including the code to the project and install extension using extension manager or with CLI `php tao/scripts/installExtension.php taoReview`. 

### LTI calls

To run review of specific delivery execution use the next endpoint:
```
https://YOUR_DOMAIN/taoReview/ReviewTool/launch?execution=YOUR_DELIVERY_EXECUTION_URI
```

Endpoint without `execution` parameter (`https://YOUR_DOMAIN/taoReview/ReviewTool/launch`) will use `lis_result_sourcedid` field from lauch data to determine delivery execution.
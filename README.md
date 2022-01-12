# Extension ltiTestReview

Extension for reviewing passed tests, with the display of actual and correct answers, as well as the number of points for each answer.

## Usage

Run `composer require "oat-sa/extension-lti-test-review"` for including the code to the project. Install the extension using extension manager or with CLI: `php tao/scripts/installExtension.php ltiTestReview`.

### LTI calls

To launch the review of a specific delivery execution, use the following endpoint:

```
https://YOUR_DOMAIN/ltiTestReview/ReviewTool/launch?execution=YOUR_DELIVERY_EXECUTION_URI
```

The above endpoint without `execution` parameter (`https://YOUR_DOMAIN/ltiTestReview/ReviewTool/launch`) will use the `lis_result_sourcedid` field from launch data to determine delivery execution.

To launch the review of the *latest* delivery execution for a user, use the following endpoint:

```
https://YOUR_DOMAIN/ltiTestReview/ReviewTool/launch1p3?delivery=YOUR_DELIVERY_URI
```

The user id should be provided in the `for_user` claim:

```json
{
  "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiSubmissionReviewRequest",
  "https://purl.imsglobal.org/spec/lti/claim/for_user": {
    "user_id": "<string>"
  }
}
```

For backwards compatibility, the following endpoint allows to select an exact delivery execution, whose id must be provided in a custom claim:

```
https://YOUR_DOMAIN/ltiTestReview/ReviewTool/launch1p3
```

```json
{
  "https://purl.imsglobal.org/spec/lti/claim/custom": {
    "execution": "<delivery_execution_id>"
  }
}
```

### LTI options

Various modes are available to review a test. By default the simplest mode is applied, showing only the test as it was passed, with the student's responses and no score.

The following custom parameters control the mode:

| parameter               | description |
|-------------------------|-------------|
| `custom_show_score=1`   | Show the student's score. |
| `custom_show_correct=1` | Show the correct responses when the student has failed. **Note:** This option discloses all the correct responses, for the whole test. |
| `custom_review_layout=simple` | Switch the review panel layout from `default` to `simple` variant. |
| `custom_section_titles=0` | Hide section titles in the `simple` review panel layout. |

When you use the [IMS emulator](http://ltiapps.net/test/tc.php) you must remove the prefix `custom_`.

#### Default values

By default the options `show_score` and `show_correct` are turned off. To turn them on by default you may change the platform configuration, in the file `config/ltiTestReview/DeliveryExecutionFinderService.conf.php`:

```php
return new oat\ltiTestReview\models\DeliveryExecutionFinderService([
    'show_score' => false,
    'show_correct' => false
]);
```

**Note:** This will set the default value of these options for the whole platform. If you enable them by default, you can still disable them using LTI custom parameters.

The default values for `custom_review_layout` and `custom_section_titles` are read from `config/taoQtiTest/testRunner.conf.php`:

```php
[
    'config' => array(
        'plugins' => array(
            'review' => array(
                'reviewLayout' => 'default',
                'displaySectionTitles' => true
            )
        )
    )
]
```

You may override them permanently by changing the values in that file (affects both test-taker review panel and LTI review panel), or temporarily by passing the custom LTI parameters when launching the review. The LTI params take precedence over the configuration values.

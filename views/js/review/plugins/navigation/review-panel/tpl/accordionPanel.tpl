<div class="review-panel accordion">
{{#if header}}
    <header class="review-panel-header">
    {{#with header}}
        <span class="review-panel-label">{{label}}</span>
        <span class="review-panel-score">{{score}}</span>
    {{/with}}
    </header>
{{/if}}
{{#if filters}}
    <ul class="review-panel-filters plain">
    {{#each filters}}
        <li class="review-panel-filter navigable" data-control="{{id}}">
            <span class="review-panel-label" title="{{title}}">{{title}}</span>
        </li>
    {{/each}}
    </ul>
{{/if}}
    <nav class="review-panel-content"></nav>
{{#if footer}}
    <footer class="review-panel-footer">
    {{#with footer}}
        <span class="review-panel-label">{{label}}</span>
        <span class="review-panel-score">{{score}}</span>
    {{/with}}
    </footer>
{{/if}}
</div>
{{#if replaceIcons}}
<style>
    {{#each replaceIcons}}
    .review-panel.accordion .review-panel-content .review-panel-item.item-{{@key}} .review-panel-label:before {
        content: "{{code}}";
        color: {{color}};
    }
    .item-answer.show-correct.{{@key}} .icon {
        color: {{color}};
    }
    .item-answer .icon-{{@key}}:before {
        content: "{{code}}";
    }
    {{/each}}
</style>
{{/if}}
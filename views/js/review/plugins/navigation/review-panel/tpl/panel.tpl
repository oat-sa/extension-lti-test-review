<div class="review-panel">
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
            <span class="review-panel-label" title="{{title}}">{{label}}</span>
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

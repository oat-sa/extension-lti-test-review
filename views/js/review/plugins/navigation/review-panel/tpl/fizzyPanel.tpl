<div class="review-panel fizzy">
    <header class="review-panel-header">
        <div class="review-panel-title">{{headerTitle}}</div>
        {{#if header}}
            <div class="review-panel-score-header">
            {{#with header}}
                <span class="review-panel-label">{{label}}</span>
                <span class="review-panel-score">{{score}}</span>
            {{/with}}
            </div>
        {{/if}}
    </header>
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
    .buttonlist-items .buttonlist-item.{{@key}} .buttonlist-btn .buttonlist-score-badge {
        background-color: {{color}};
    }
    .buttonlist-item.{{@key}} .buttonlist-score-badge .icon-{{@key}}:before {
        content: "{{code}}";
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
